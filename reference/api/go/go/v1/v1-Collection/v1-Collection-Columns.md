---
title: "Columns | Go | v1"
slug: /go/v1-Collection-Columns
sidebar_label: "Columns"
beta: NEAR DEPRECATE
notebook: FALSE
description: "The struct types on this page implement the method signatures of the `entity.Column` interface. | Go | v1"
type: origin
token: GftcwnSu7iOCbDk1wGTc9sE3nwb
sidebar_position: 18
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Columns

The struct types on this page implement the method signatures of the `entity.Column` interface.

## entity.ColumnBool{#entitycolumnbool}

This struct type defines a boolean column. You can use `entity.NewColumnBool()` to create one for the `insert()` request as follows:

```go
// Initiate a boolean column
columnBool := entity.NewColumnBool(name string, values []bool)

// Add more values to the column
columnBool.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;bool</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>bool, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnBoolArray{#entitycolumnboolarray}

This struct type defines a boolean array column. You can use `entity.NewColumnBoolArray()` to create one for the `insert()` request as follows:

```go
// Initiate a boolean array column
columnBoolArray := entity.NewColumnBoolArray(name string, values [][]bool)

// Add more values to the column
columnBoolArray.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;bool</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;bool, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnDouble{#entitycolumndouble}

This struct type defines a double column. You can use `entity.NewColumnDouble()` to create one for the `insert()` request as follows:

```go
// Initiate a double column
columnDouble := entity.NewColumnDouble(name string, values []float64)

// Add more values to the column
columnDouble.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;float64</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>float64, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnDoubleArray{#entitycolumndoublearray}

This struct type defines a double array column. You can use `entity.NewColumnDoubleArray()` to create one for the `insert()` request as follows:

```go
// Initiate a double array column
columnDoubleArray := entity.NewColumnDoubleArray(name string, values [][]float64)

// Add more values to the column
columnDoubleArray.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;float64</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;float64, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnFloat{#entitycolumnfloat}

This struct type defines a float column. You can use `entity.NewColumnFloat()` to create one for the `insert()` request as follows:

```go
// Initiate a float column
columnFloat := entity.NewColumnFloat(name string, values []float32)

// Add more values to the column
columnFloat.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;float32</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>float32, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnFloatArray{#entitycolumnfloatarray}

This struct type defines a float array column. You can use `entity.NewColumnFloatArray()` to create one for the `insert()` request as follows:

```go
// Initiate a float array column
columnFloatArray := entity.NewColumnFloatArray(name string, values [][]float32)

// Add more values to the column
columnFloatArray.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;float32</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;float32, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnInt8{#entitycolumnint8}

This struct type defines an Int8 column. You can use `entity.NewColumnInt8()` to create one for the `insert()` request as follows:

```go
// Initiate an int8 column
columnInt8 := entity.NewColumnInt8(name string, values []int8)

// Add more values to the column
columnInt8.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;int8</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>int8, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

## entity.ColumnInt8Array{#entitycolumnint8array}

This struct type defines an Int8 array column. You can use `entity.NewColumnInt8Array()` to create one for the `insert()` request as follows:

```go
// Initiate an int8 array column
columnInt8Array := entity.NewColumnInt8Array(name string, values [][]int8)

// Add more values to the column
columnInt8Array.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;int8</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;int8, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnInt16{#entitycolumnint16}

This struct type defines an Int16 column. You can use `entity.NewColumnInt16()` to create one for the `insert()` request as follows:

```go
// Initiate an int16 column
columnInt16 := entity.NewColumnInt16(name string, values []int16)

// Add more values to the column
columnInt16.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;int16</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>int16, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

## entity.ColumnInt16Array{#entitycolumnint16array}

This struct type defines an Int16 array column. You can use `entity.NewColumnInt16Array()` to create one for the `insert()` request as follows:

```go
// Initiate an int16 array column
columnInt16Array := entity.NewColumnInt16Array(name string, values [][]int16)

// Add more values to the column
columnInt16Array.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;int16</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;int16, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnInt32{#entitycolumnint32}

This struct type defines an Int32 column. You can use `entity.NewColumnInt32()` to create one for the `insert()` request as follows:

```go
// Initiate an int32 column
columnInt32 := entity.NewColumnInt32(name string, values []int32)

// Add more values to the column
columnInt32.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;int32</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>int32, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

## entity.ColumnInt32Array{#entitycolumnint32array}

This struct type defines an Int32 array column. You can use `entity.NewColumnInt32Array()` to create one for the `insert()` request as follows:

```go
// Initiate an int32 array column
columnInt32Array := entity.NewColumnInt32Array(name string, values [][]int32)

// Add more values to the column
columnInt32Array.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;int32</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;int32, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnInt64{#entitycolumnint64}

This struct type defines an Int64 column. You can use `entity.NewColumnInt64()` to create one for the `insert()` request as follows:

```go
// Initiate an int64 column
columnInt64 := entity.NewColumnInt64(name string, values []int64)

// Add more values to the column
columnInt64.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;int64</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>int64, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

## entity.ColumnInt64Array{#entitycolumnint64array}

This struct type defines an Int64 array column. You can use `entity.NewColumnInt64Array()` to create one for the `insert()` request as follows:

```go
// Initiate an int64 array column
columnInt64Array := entity.NewColumnInt64Array(name string, values [][]int64)

// Add more values to the column
columnInt64Array.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;int64</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;int64, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnJSONBytes{#entitycolumnjsonbytes}

This struct type defines a JSONBytes column. You can use `entity.NewColumnJSONBytes()` to create one for the `insert()` request as follows:

```go
// Initiate a JSONBytes column
columnJSONBytes := entity.NewColumnJSONBytes(name string, values [][]byte)

// Add more values to the column
columnJSONBytes.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;byte</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;byte, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
   <tr>
     <td><p><code>WithIsDynamic(isDynamic bool)</code></p></td>
     <td><p><code>*entity.ColumnJSONBytes</code></p></td>
     <td></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsInt64()`

## entity.ColumnVarChar{#entitycolumnvarchar}

This struct type defines a VarChar column. You can use `entity.NewColumnVarChar()` to create one for the `insert()` request as follows:

```go
// Initiate a VarChar column
columnVarChar := entity.NewColumnVarChar(name string, values []string)

// Add more values to the column
columnVarChar.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;string</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>string, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsInt64()`

## entity.ColumnVarCharArray{#entitycolumnvarchararray}

This struct type defines a VarChar array column. You can use `entity.NewColumnVarCharArray()` to create one for the `insert()` request as follows:

```go
// Initiate a VarChar array column
columnVarCharArray := entity.NewColumnVarCharArray(name string, values [][]string)

// Add more values to the column
columnVarCharArray.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;string</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>&#91;&#93;string, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnBFloat16Vector{#entitycolumnbfloat16vector}

This struct type defines a binary float16 vector column. You can use `entity.NewColumnBFloat16Vector()` to create one for the `insert()` request as follows:

```go
// Initiate a binary float16 vector column
columnBFloat16Vector := entity.NewColumnBFloat16Vector(name string, dim int, values [][]byte)

// Add more values to the column
columnBFloat16Vector.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;byte</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>Dim()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the dimensionality of this vector field.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnBinaryVector{#entitycolumnbinaryvector}

This struct type defines a binary vector column. You can use `entity.NewColumnBinaryVector()` to create one for the `insert()` request as follows:

```go
// Initiate a binary vector column
columnBinaryVector := entity.NewColumnBinaryVector(name string, dim int, values [][]byte)

// Add more values to the column
columnBinaryVector.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;byte</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>Dim()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the dimensionality of this vector field.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnFloat16Vector{#entitycolumnfloat16vector}

This struct type defines a binary float16 vector column. You can use `entity.NewColumnBFloat16Vector()` to create one for the `insert()` request as follows:

```go
// Initiate a float16 vector column
columnFloat16Vector := entity.NewColumnFloat16Vector(name string, dim int, values [][]byte)

// Add more values to the column
columnFloat16Vector.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;byte</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>Dim()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the dimensionality of this vector field.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnFloatVector{#entitycolumnfloatvector}

This struct type defines a float vector column. You can use `entity.NewColumnFloatVector()` to create one for the `insert()` request as follows:

```go
// Initiate a float vector column
columnFloatVector := entity.NewColumnFloatVector(name string, dim int, values [][]byte)

// Add more values to the column
columnFloatVector.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;&#91;&#93;byte</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>Dim()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the dimensionality of this vector field.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

## entity.ColumnSparseFloatVector{#entitycolumnsparsefloatvector}

This struct type defines a sparse float vector column. You can use `entity.NewColumnSparseFloatVector()` to create one for the `insert()` request as follows:

```go
// Initiate a sparse float vector column
columnSparseFloatVector := entity.NewColumnFloatVector(name string, values []SparseEmbedding)

// Add more values to the column
columnSparseFloatVector.AppendValue(i interface{})
```

In addition to the methods defined in the `entity.Column` interface, this struct type also defines the following methods.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Data()</code></p></td>
     <td><p><code>&#91;&#93;entity.SparseEmbedding</code></p></td>
     <td><p>Return all data in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>ValueByIdx(idx int)</code></p></td>
     <td><p><code>entity.SparseEmbedding, error</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
</table>

This struct type does not implement the following methods:

- `GetAsBool()`

- `GetAsDouble()`

- `GetAsString()`

- `GetAsInt64()`

### entity.SparseEmbedding{#entitysparseembedding}

This interface type defines a set of signatures as follows:

```go
type SparseEmbedding interface {
    Dim() int // the dimension
    Len() int // the actual items in this vector
    Get(idx int) (pos uint32, value float32, ok bool)
    Serialize() []byte
    FieldType() FieldType
}
```

<table>
   <tr>
     <th><p>Method Signature</p></th>
     <th><p>Return Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>Dim()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the dimensionality of the sparse vector embedding.</p></td>
   </tr>
   <tr>
     <td><p><code>Len()</code></p></td>
     <td><p><code>int</code></p></td>
     <td><p>Return the number of rows in the column.</p></td>
   </tr>
   <tr>
     <td><p><code>Get(idx int)</code></p></td>
     <td><p><code>pos unit32, value float32, ok bool</code></p></td>
     <td><p>Return the value at the specified ID in the column or an error.</p></td>
   </tr>
   <tr>
     <td><p><code>Serialize()</code></p></td>
     <td><p><code>&#91;&#93;byte</code></p></td>
     <td><p>Return the serialized sparse vector embedding.</p></td>
   </tr>
   <tr>
     <td><p><code>FieldType()</code></p></td>
     <td><p><code>entity.FieldType</code></p></td>
     <td><p>Return the field type of the sparse vector embedding.</p></td>
   </tr>
</table>

You can create a sparse embedding slice using the `entity.NewSliceSparseEmbedding()` method.

```go
slice := entity.NewSliceSparseEmbedding(postitions []uint32, values []float32)
```
