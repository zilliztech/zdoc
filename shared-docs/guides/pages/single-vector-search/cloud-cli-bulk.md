```shell
zilliz vector search \
  --collection quick_setup \
  --body '{
  "data": [
    [
      0.041732933,
      0.013779674,
      -0.027564144,
      -0.013061441,
      0.009748648
    ],
    [
      0.0039737443,
      0.003020432,
      -0.0006188639,
      0.03913546,
      -0.00089768134
    ]
  ],
  "annsField": "vector",
  "limit": 3
}' \
  --output json
```
