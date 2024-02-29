---
displayed_sidbar: pythonSidebar
slug: /python/PyMilvusLegacy-Connections
beta: false
notebook: false
type: folder
token: Jy4gf9SrBlUSnpdXg2VcTuwhn4g
sidebar_position: 3
---

# Connections

A __Connections__ instance represents a pool of connections to your Milvus instances.

```python
class pymilvus.Connections
```

## Constructor{#constructor}

Constructs a singleton instance to manage all connections. 

<div class="admonition note">

<p><b>notes</b></p>

<p>Instead of creating a new instance of this class on your own, import the existing singleton instance as shown in the following example.</p>

</div>

## Examples{#examples}

```python
from pymilvus import connections    

# Establish a connection
connections.connect(
    uri="http://localhost:19530", 
    token="root:Milvus"
)  
```

## Methods{#methods}

The following are the methods of the `connections` singleton instance:

<DocCardList />