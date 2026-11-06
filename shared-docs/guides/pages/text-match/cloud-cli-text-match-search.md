```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Search documents containing "machine deep" with vector similarity
zilliz collection search --collection-name my_collection --vector-field embeddings --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --filter "TEXT_MATCH(text, 'machine deep')" --limit 10 --output-fields "id,text" 
```
