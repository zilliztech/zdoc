```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Query documents containing "machine" and "learning" but not "deep"
zilliz collection query --collection-name my_collection --filter "not TEXT_MATCH(text, 'deep') and TEXT_MATCH(text, 'machine') and TEXT_MATCH(text, 'learning')" --output-fields "id,text" 
```
