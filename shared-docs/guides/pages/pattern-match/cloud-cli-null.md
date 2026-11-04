```shell
zilliz vector query --collection log_events --filter 'message !~ "^DEBUG" OR message IS NULL' --output-fields 'message,severity'
```
