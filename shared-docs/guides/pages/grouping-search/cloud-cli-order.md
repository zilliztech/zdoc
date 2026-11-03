```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.
# Select an on-demand cluster containing product_catalog.
zilliz vector search \
  --collection product_catalog \
  --body '{
  "data": [
    [
      0.14529211512077012,
      0.9147257273453546,
      0.7965055218724449,
      0.7009258593102812,
      0.5605206522382088
    ]
  ],
  "annsField": "embedding",
  "limit": 20,
  "groupingField": "category",
  "groupSize": 3,
  "strictGroupSize": true,
  "outputFields": [
    "category",
    "price",
    "rating"
  ],
  "orderByFields": [
    "price:asc"
  ]
}' \
  --output json
```
