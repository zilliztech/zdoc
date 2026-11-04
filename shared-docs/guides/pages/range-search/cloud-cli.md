```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --body '{
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "searchParams": {
        "params": {
            "radius": 0.4,
            "range_filter": 0.6
        }
    }
}' \
  --output json
```
