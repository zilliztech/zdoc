```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Create a collection with English analyzer for text matching
zilliz collection create --collection-name my_collection --schema '{
  "autoId": true,
  "enabledDynamicField": false,
  "fields": [
    {
      "fieldName": "id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "text",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": 1000,
        "enable_analyzer": true,
        "enable_match": true,
        "analyzer_params": {
          "type": "english"
        }
      }
    },
    {
      "fieldName": "embeddings",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": 5
      }
    }
  ]
}' 
```
