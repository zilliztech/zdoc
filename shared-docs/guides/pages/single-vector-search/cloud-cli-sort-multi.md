```shell
zilliz vector search \
  --collection quick_setup \
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
  "outputFields": [
    "price",
    "rating"
  ],
  "orderByFields": [
    "price:asc",
    "rating:desc"
  ],
  "limit": 3
}' \
  --output json
```
