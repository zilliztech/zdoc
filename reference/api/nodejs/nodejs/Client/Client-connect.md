---
title: "connect() | Node.js"
slug: /node/node/Client-connect
sidebar_label: "connect()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This method connects to the Zilliz Cloud cluster using the optionally specified SDK version. | Node.js"
type: docx
token: SkLsdMpB7oiZLMx8T04cCd9Knqf
sidebar_position: 4
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - connect()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# connect()

This method connects to the Zilliz Cloud cluster using the optionally specified SDK version.

```javascript
connect(sdkVersion): void
```

## Request Syntax\{#request-syntax}

```javascript
connect({
    sdkVersion: string
})
```

**PARAMETERS:**

- **sdkVersion** (*string*) -

    **[REQUIRED]**

    The version of your Node.js SDK.

**RETURNS** *void*

This method returns nothing.

## Example\{#example}

```java
connect(2.3.5)
```

