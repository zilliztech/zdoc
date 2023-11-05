# insert()

Inserts entities into a collection.

> 📘 Note
>
> If the field type is binary, the length of the vector data is equal to the dimension value divided by 8.

```javascript
insert(
  collection_name,
  data,
  partition_name,
  timeout
)
```

## Examples

```javascript
const vectorsData = Array.from({ length: 10 }).map(() => ({
  vector_01: Array.from({ length: 4 }).map(() =>
    Math.floor(Math.random() * 10)
  ),
}));

new milvusClient(ADDRESS).insert({
  collection_name: COLLECTION_NAME,
  data: vectorsData,
});
```

Success response:

```javascript
{
  status: { error_code: 'Success', reason: '' },
  succ_index: [
     0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
    ... 990 more items
  ],
  err_index: [],
  acknowledged: false,
  insert_cnt: '1',
  delete_cnt: '0',
  upsert_cnt: '0',
  timestamp: '434849944099356674',
  IDs: {
    int_id: {
      data: [
        '434848878802250134',
        ...999 more items,
      ],
    },
    id_field: 'int_id',
  },
}
```

## Parameters

| Parameter      | Description                                                                                                                                                                       | Type                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `collection_name` | Name of the collection where data is to be inserted.                                                                                                                                        | String                 |
| `data`            | A list of dictionaries to insert.                                                                                                                                                                       | list[Dictionary] |
| `partition_name` | Name of the partition where data is to be inserted.                                                                                                                                         | String                 |
| `timeout`        | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number                 |

## Raises

None

## Returns

A list of dictionaries.