---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /nodejs/show_collection
---

# showCollections()

调用接口查询当前已创建的所有 Collection。

```javascript
showCollections()
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).showCollections();
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    {
      name: 'my_collection',
      id: '434826867399720961',
      timestamp: '1658732862090',
      loadedPercentage: undefined
    }
  ]，
  created_timestamps: [ '434826867399720964' ],
  created_utc_timestamps: [ '1658732862090' ],
}
```

## 请求参数

None

## 抛出

None

## 返回结果

以字典列返回结果。