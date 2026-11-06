```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Query documents containing "keyword1" or "keyword2"
zilliz collection query --collection-name my_collection --filter "TEXT_MATCH(text, 'keyword1 keyword2')" --output-fields "id,text" 
```
