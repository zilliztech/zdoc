| Struct subfield physical type | Support | Notes |
| --- | --- | --- |
| Array&lt;Bool&gt; | Supported | Define the subfield as `DataType.BOOL`. |
| Array&lt;Int8/Int16/Int32/Int64&gt; | Supported | Define the subfield as `DataType.INT8`, `DataType.INT16`, `DataType.INT32`, or `DataType.INT64`. |
| Array&lt;Float/Double&gt; | Supported | Define the subfield as `DataType.FLOAT` or `DataType.DOUBLE`. |
| Array&lt;VarChar&gt; | Supported | Define the subfield as `DataType.VARCHAR` and set `max_length`. |
| ArrayOfVector&lt;FloatVector&gt; | Supported | Define the subfield as `DataType.FLOAT_VECTOR` and set `dim`. |
| ArrayOfVector&lt;Float16Vector&gt; | Supported | Define the subfield as `DataType.FLOAT16_VECTOR` and set `dim`. |
| ArrayOfVector&lt;BFloat16Vector&gt; | Supported | Define the subfield as `DataType.BFLOAT16_VECTOR` and set `dim`. |
| ArrayOfVector&lt;Int8Vector&gt; | Supported | Define the subfield as `DataType.INT8_VECTOR` and set `dim`. |
| ArrayOfVector&lt;BinaryVector&gt; | Supported | Define the subfield as `DataType.BINARY_VECTOR` and set `dim`. |
| ArrayOfVector&lt;SparseFloatVector&gt; | Not supported | Sparse vector subfields are not supported in StructArray fields. |
| Array&lt;String&gt; | Not supported | Use `VARCHAR`, not `String`. |
| Array&lt;JSON&gt; | Not supported | JSON subfields are not supported in StructArray fields. |
| Array&lt;Geometry&gt; | Not supported | Geometry subfields and GIS functions are not supported in StructArray fields. |
| Array&lt;Text&gt; | Not supported | Text subfields are not supported in StructArray fields. |
| Array&lt;Timestamptz&gt; | Not supported | Timestamptz subfields and time-specific expressions are not supported in StructArray fields. |
| Array&lt;Array&gt; | Supported | Define the subfield as `DataType.ARRAY` with a scalar `element_type` and a `max_capacity` for the inner array. Each Struct element then holds one inner array. Set `nullable=True` on the subfield to allow a null inner array and `element_nullable=True` to allow null values inside it. |
| `Array` of `Array` of `Array`, `Array` of vectors, `Struct`, or `ArrayOfStruct` | Not supported | Array nesting inside a Struct is limited to one level, the inner array cannot hold vectors, and nested Struct or Array-of-Struct subfields are not supported. |
