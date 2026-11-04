```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Iterate through results with pagination (batch_size=50)
# Batch 1: offset 0
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 0 --output-fields "id,color"

# Batch 2: offset 50
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 50 --output-fields "id,color"

# Batch 3: offset 100
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 100 --output-fields "id,color"

# Continue incrementing offset by 50 until an empty page is returned
```
