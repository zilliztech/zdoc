---
displayed_sidbar: pythonSidebar
slug: /python/PyMilvusLegacy-Connections
beta: false
notebook: false
type: folder
token: Jy4gf9SrBlUSnpdXg2VcTuwhn4g
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Connections

A __Connections__ instance represents a pool of connections to your Milvus instances.

```python
class pymilvus.Connections
```

## Constructor{#constructor}

Constructs a singleton instance to manage all connections. 

<Admonition type="info" icon="📘" title="Notes">

<p>Instead of creating a new instance of this class on your own, import the existing singleton instance as shown in the following example.</p>

</Admonition>

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

import DocCardList from '@theme/DocCardList';

<DocCardList />