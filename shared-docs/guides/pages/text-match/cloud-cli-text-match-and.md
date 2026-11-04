```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Query documents containing both "machine" and "deep"
zilliz collection query --collection-name my_collection --filter "TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'deep')" --output-fields "id,text" 
```
