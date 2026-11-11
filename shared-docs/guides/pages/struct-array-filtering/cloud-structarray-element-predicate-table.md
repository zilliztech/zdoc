| Subfield type | Element-level predicate support |
| --- | --- |
| `BOOL` | Scalar predicates such as `$[has_code] == true` or `!($[has_code] == true)`. Avoid bare boolean expressions such as `$[has_code]`. |
| `INT8`, `INT16`, `INT32`, `INT64` | Comparison, chained range, `in`, `not in`, arithmetic expressions with `+`, `-`, `*`, `/`, or `%` followed by comparison, and logical combinations. |
| `FLOAT`, `DOUBLE` | Comparison, chained range, `in`, `not in`, arithmetic expressions with `+`, `-`, `*`, or `/` followed by comparison, and logical combinations. The `%` operator is not supported for floating-point subfields. |
| `VARCHAR` | String comparison, chained range, `in`, `not in`, `like`, `=~`, `!~`, and logical combinations. |
| Scalar `ARRAY` subfields | `array_contains`, `array_contains_any`, `array_contains_all`, and `array_length` on `$[tags]`, plus `$[tags] is null` and `$[tags] is not null`. Comparison operators, `in`, and `like` on `$[tags]` are rejected. |
| Any element-nullable subfield | `$[subfield] is null` and `$[subfield] is not null` test whether the value in the current Struct element is null. On a subfield that cannot hold null values, `is null` is always false. |
| Vector subfields | Not supported as `$[...]` scalar predicate inputs, except `$[emb] is null` and `$[emb] is not null` on an element-nullable vector subfield. Use vector subfields through EmbeddingList search or element-level vector search instead. |
