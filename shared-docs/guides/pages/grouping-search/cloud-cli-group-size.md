```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.
zilliz vector search \
  --collection my_collection \
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
  "annsField": "vector",
  "limit": 5,
  "groupingField": "docId",
  "outputFields": [
    "docId"
  ],
  "groupSize": 2,
  "strictGroupSize": true
}' \
  --output json
```
