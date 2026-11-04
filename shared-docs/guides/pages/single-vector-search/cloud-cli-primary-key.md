```shell
zilliz vector search \
  --collection quick_setup \
  --data '[]' \
  --body '{
  "ids": [
    1,
    2,
    3
  ],
  "annsField": "vector",
  "limit": 3
}' \
  --output json
```
