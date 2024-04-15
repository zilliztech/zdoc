---
displayed_sidbar: nodeSidebar
slug: /node/Client-connect
beta: false
notebook: false
type: docx
token: SkLsdMpB7oiZLMx8T04cCd9Knqf
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# connect()

This method connects to the Zilliz Cloud cluster using the optionally specified SDK version.

```javascript
connect(sdkVersion): *void*
```

## Request Syntax{#request-syntax}

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

## Example{#example}

```java
connect(2.3.5)
```

