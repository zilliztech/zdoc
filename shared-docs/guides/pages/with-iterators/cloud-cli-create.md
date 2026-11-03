```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Create a search with pagination (equivalent to the first batch of a SearchIterator)
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 0 --output-fields "id,color" 
```
