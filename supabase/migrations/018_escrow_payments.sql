-- ============================================================
-- Migration 018: Escrow Payment System
-- ============================================================

-- 1. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'escrowed', 'released', 'refunded', 'disputed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  platform_fee NUMERIC(12,2) DEFAULT 0,
  creator_payout NUMERIC(12,2),
  brand_clerk_id TEXT NOT NULL,
  creator_clerk_id TEXT NOT NULL,
  escrowed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_collaboration ON payments(collaboration_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_brand ON payments(brand_clerk_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator ON payments(creator_clerk_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- 3. Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for payments
-- Brand can view their payments
CREATE POLICY "Brands can view their payments" ON payments
  FOR SELECT USING (brand_clerk_id = auth.uid());

-- Creator can view their payments
CREATE POLICY "Creators can view their payments" ON payments
  FOR SELECT USING (creator_clerk_id = auth.uid());

-- Brand can insert payments
CREATE POLICY "Brands can insert payments" ON payments
  FOR INSERT WITH CHECK (brand_clerk_id = auth.uid());

-- Brand can update their payments (for escrow)
CREATE POLICY "Brands can update their payments" ON payments
  FOR UPDATE USING (brand_clerk_id = auth.uid());

-- Creator can update payments (for disputes)
CREATE POLICY "Creators can update payments for disputes" ON payments
  FOR UPDATE USING (
    creator_clerk_id = auth.uid() AND
    status IN ('escrowed', 'released')
  );

-- 5. Function to calculate platform fee (10% of amount)
CREATE OR REPLACE FUNCTION calculate_platform_fee(p_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_amount * 0.10, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Function to calculate creator payout
CREATE OR REPLACE FUNCTION calculate_creator_payout(p_amount NUMERIC, p_platform_fee NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN p_amount - p_platform_fee;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Trigger to auto-calculate fees on insert
CREATE OR REPLACE FUNCTION auto_calculate_payment_fees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.platform_fee IS NULL OR NEW.platform_fee = 0 THEN
    NEW.platform_fee := calculate_platform_fee(NEW.amount);
  END IF;
  
  IF NEW.creator_payout IS NULL OR NEW.creator_payout = 0 THEN
    NEW.creator_payout := calculate_creator_payout(NEW.amount, NEW.platform_fee);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_payment_fees
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_payment_fees();

-- 8. Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set status timestamps
  IF NEW.status = 'escrowed' AND OLD.status != 'escrowed' THEN
    NEW.escrowed_at = NOW();
  END IF;
  
  IF NEW.status = 'released' AND OLD.status != 'released' THEN
    NEW.released_at = NOW();
  END IF;
  
  IF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
    NEW.refunded_at = NOW();
  END IF;
  
  IF NEW.status = 'disputed' AND OLD.status != 'disputed' THEN
    NEW.disputed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

-- 9. Create payment history table for audit trail
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_payment ON payment_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at DESC);

-- 10. Enable RLS for payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 11. RLS for payment_history
CREATE POLICY "Users can view payment history for their payments" ON payment_history
  FOR SELECT USING (
    payment_id IN (
      SELECT id FROM payments 
      WHERE brand_clerk_id = auth.uid() OR creator_clerk_id = auth.uid()
    )
  );

-- 12. Trigger to log payment status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO payment_history (payment_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_payment_status_change
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_status_change();
