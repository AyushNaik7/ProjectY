import streamlit as st
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import CountVectorizer
from community import community_louvain

st.title("📊 Social Media Analytics Dashboard")

# Sample Data
data = {
    "user": ["A","B","C","D","E","F","G","H"],
    "text": [
        "AI is the future",
        "Machine learning is amazing",
        "Deep learning and AI",
        "Stock market is risky",
        "Invest in stocks wisely",
        "Trading strategies matter",
        "AI in finance",
        "Machine learning for trading"
    ]
}

df = pd.DataFrame(data)

st.subheader("📄 Raw Data")
st.write(df)

# Text Processing
vectorizer = CountVectorizer(stop_words='english')
X = vectorizer.fit_transform(df['text'])
similarity = (X * X.T).toarray()

# Graph
G = nx.Graph()

for i, user in enumerate(df['user']):
    G.add_node(user)

threshold = st.slider("Similarity Threshold", 0, 5, 1)

for i in range(len(df)):
    for j in range(i+1, len(df)):
        if similarity[i][j] > threshold:
            G.add_edge(df['user'][i], df['user'][j])

# Community Detection
partition = community_louvain.best_partition(G)

# Visualization
st.subheader("🌐 Network Graph")

fig, ax = plt.subplots()
pos = nx.spring_layout(G)
colors = [partition[node] for node in G.nodes()]

nx.draw(G, pos, with_labels=True, node_color=colors, cmap=plt.cm.Set3, node_size=2000, ax=ax)

st.pyplot(fig)

# Influencers
st.subheader("⭐ Influential Users")

centrality = nx.degree_centrality(G)
sorted_users = sorted(centrality.items(), key=lambda x: x[1], reverse=True)

st.write(sorted_users)