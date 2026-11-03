```shell
zilliz vector query --collection log_events --filter 'message =~ "E[0-9]{4}"' --output-fields 'message,severity'
```
