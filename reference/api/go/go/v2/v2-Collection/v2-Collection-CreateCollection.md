---
title: "CreateCollection() | Go | v2"
slug: /go/v2-Collection-CreateCollection
sidebar_label: "CreateCollection()"
beta: FALSE
notebook: FALSE
description: "This method creates a collection. | Go | v2"
type: origin
token: TbsowUEnFiT14Hkaf0dcgQKInFg
sidebar_position: 11
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateCollection()

This method creates a collection. 

```go
func (c *Client) CreateCollection(ctx context.Context, option CreateCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Parameters{#request-parameters}

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>ctx</code></p></td>
     <td><p>Context for the current call to work.</p></td>
     <td><p><code>context.Context</code></p></td>
   </tr>
   <tr>
     <td><p><code>option</code></p></td>
     <td><p>Optional parameters of the methods.</p></td>
     <td><p><code>CreateCollectionOption</code></p></td>
   </tr>
   <tr>
     <td><p><code>callOpts</code></p></td>
     <td><p>Optional parameters for calling the methods.</p></td>
     <td><p><code>grpc.CallOption</code></p></td>
   </tr>
</table>

## CreateCollectionOption{#createcollectionoption}

This is an interface type. The `createCollectionOption` struct type implements this interface type. 

You can use the `NewCreateCollectionOption()` or `SimpleCreateCollectionOptions()` function to get the concrete implementation.

### NewCreateCollectionOption{#newcreatecollectionoption}

The signature of this method is as follows:

```go
func NewCreateCollectionOption(name string, collectionSchema *entity.Schema) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the collection to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>collectionSchema</code></p></td>
     <td><p>Schema of the collection.</p><p>This parameter applies when creating a collection with a custom schema.</p></td>
     <td><p><code>*entity.Schema</code></p></td>
   </tr>
</table>

You can chain the following methods to append more parameters to the `createCollectionOption` struct.

- [WithShardNum](./v2-Collection-CreateCollection#withshardnum)

- [WithIndexOptions](./v2-Collection-CreateCollection#withindexoptions)

- [WithProperty](./v2-Collection-CreateCollection#withproperty)

- [WithConsistencyLevel](./v2-Collection-CreateCollection#withconsistencylevel)

- [WithIndexOptions](./v2-Collection-CreateCollection#withindexoptions)

### SimpleCreateCollectionOptions{#simplecreatecollectionoptions}

This method outputs the options for creating a collection in a quick-setup manner. The signature of this method is as follows:

```go
func SimpleCreateCollectionOptions(name string, dim int64) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the collection to create.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>dim</code></p></td>
     <td><p>Dimensionality of the vector field.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

You can chain the following methods to append more parameters to the `createCollectionOption` struct.

- [WithAutoID](./v2-Collection-CreateCollection#withautoid)

- [WithDynamicSchema](./v2-Collection-CreateCollection#withdynamicschema)

- [WithVarcharPK](./v2-Collection-CreateCollection#withvarcharpk)

- [WithIndexOptions](./v2-Collection-CreateCollection#withindexoptions)

### WithAutoID{#withautoid}

This method appends the settings regarding the `autoID` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithAutoID(autoID bool) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>autoID</code></p></td>
     <td><p>Whether to allow Milvus to automatically allocate the primary keys for incoming entities.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### WithShardNum{#withshardnum}

This method appends the settings regarding the `shardNum` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithShardNum(shardNum int32) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>shardNum</code></p></td>
     <td><p>Number of shards to create along with the collection. A shard corresponds to a data input channel.</p></td>
     <td><p><code>int32</code></p></td>
   </tr>
</table>

### WithDynamicSchema{#withdynamicschema}

This method appends the settings regarding the `enableDynamicField` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithDynamicSchema(dynamicSchema bool) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>enableDynamicSchema</code></p></td>
     <td><p>Whether to enable the dynamic field. </p><p>If set to <code>true</code>, non-schema-defined fields and their values in incoming entities will be saved as key-value pairs in a reserved field of the JSON type named <code>$meta</code>. </p><p>For details, refer to <a href="/docs/enable-dynamic-field">Dynamic Field</a>.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### WithVarcharPK{#withvarcharpk}

This method appends the settings regarding the `varcharPK`  and `varcharPKMaxLength`parameters to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithVarcharPK(varcharPK bool, maxLen int) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>varcharPK</code></p></td>
     <td><p>Whether to use a primary key of the VarChar type.</p><p>This parameter applies when creating a collection in a quick-setup manner.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
   <tr>
     <td><p><code>maxLen</code></p></td>
     <td><p>Maximum length for the primary key of the VarChar type. </p><p>This parameter applies only when <code>varcharPK</code> is set to <code>true</code>.</p></td>
     <td><p><code>int</code></p></td>
   </tr>
</table>

### WithIndexOptions{#withindexoptions}

This method appends the settings regarding the `indexOptions` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithIndexOptions(indexOpts ...CreateIndexOption) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>indexOptions</code></p></td>
     <td><p>Index options.</p><p>This parameter applies when creating a collection with a custom schema. Once set, Milvus automatically loads the collection after it is created.</p></td>
     <td><p><code>[]CreateIndexOption</code></p></td>
   </tr>
</table>

### WithProperty{#withproperty}

This method appends the settings regarding the `properties` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithProperty(key string, value any) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>properties</code></p></td>
     <td><p>Other collection properties.</p></td>
     <td><p><code>map[string]string</code></p></td>
   </tr>
</table>

### WithConsistencyLevel{#withconsistencylevel}

This method appends the settings regarding the `consistencyLevel` parameter to the `createCollectionOption` struct. The signature of the method is as follows:

```go
func (opt *createCollectionOption) WithConsistencyLevel(cl entity.ConsistencyLevel) *createCollectionOption
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>consistencyLevel</code></p></td>
     <td><p>Consistency level of the collection.</p><p>For details, refer to <a href="/docs/consistency-level">Consistency Level</a>.</p></td>
     <td><p><code>entity.ConsistencyLevel</code></p></td>
   </tr>
</table>

## entity.Schema{#entityschema}

You can use the `entity.NewSchema` method to get the concrete implementation of the `entity.Schema` struct type.

### entity.NewSchema{#entitynewschema}

This method creates an empty schema. You can chain the following methods to append corresponding parameters to the created schema.

- [WithAutoID](./v2-Collection-CreateCollection#entitywithautoid)

- [WithDescription](./v2-Collection-CreateCollection#entitywithdescription)

- [WithDynamicFieldEnabled](./v2-Collection-CreateCollection#entitywithdynamicfieldenabled)

- [WithField](./v2-Collection-CreateCollection#entitywithfield)

- [WithFunction](./v2-Collection-CreateCollection#entitywithfunction)

- [WithName](./v2-Collection-CreateCollection#entitywithname)

### entity.WithAutoID{#entitywithautoid}

This method appends the settings regarding the `autoID` parameter to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *entity.Schema) WithAutoID(autoID bool) *entity.Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>autoID</code></p></td>
     <td><p>Whether the primary keys of the incoming entities automatically increments.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithDescription{#entitywithdescription}

This method appends the schema description to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *entity.Schema) WithDescription(desc string) *entity.Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>desc</code></p></td>
     <td><p>Description of the schema.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### entity.WithDynamicFieldEnabled{#entitywithdynamicfieldenabled}

The method appends the settings regarding the `EnableDynamicField` to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *entity.Schema) WithDynamicFieldEnabled(dynamicEnabled bool) *entity.Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>dynamicEnabled</code></p></td>
     <td><p>Whether to enable the dynamic field. </p><p>If set to <code>true</code>, non-schema-defined fields and their values in incoming entities will be saved as key-value pairs in a reserved field of the JSON type named <code>$meta</code>. </p><p>For details, refer to <a href="/docs/enable-dynamic-field">Dynamic Field</a>.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithField{#entitywithfield}

The method appends a field object to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *entity.Schema) WithField(f *entity.Field) *entity.Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>f</code></p></td>
     <td><p>An <code>entity.Field</code> object.</p></td>
     <td><p><code>*entity.Field</code></p></td>
   </tr>
</table>

### entity.WithFunction{#entitywithfunction}

The method appends a function object to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *entity.Schema) WithFunction(f *entity.Function) *entity.Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>f</code></p></td>
     <td><p>An <code>entity.Function</code> object.</p></td>
     <td><p><code>*entity.Function</code></p></td>
   </tr>
</table>

### entity.WithName{#entitywithname}

The method appends the schema name to the `entity.Schema` struct. The signature of the method is as follows:

```go
func (s *Schema) WithName(name string) *Schema
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the schema.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## entity.Field{#entityfield}

You can use the `entity.NewField` method to get the concrete implementation of the `entity.Field` struct type.

### entity.NewField{#entitynewfield}

This method creates an empty field schema. You can chain the following methods to append corresponding parameters to the created field schema.

- [WithAnalyzerParams](./v2-Collection-CreateCollection#entitywithanalyzerparams)

- [WithDataType](./v2-Collection-CreateCollection#entitywithdatatype)

- [WithDefaultValueBool](./v2-Collection-CreateCollection#entitywithdefaultvaluebool)

- [WithDefaultValueDouble](./v2-Collection-CreateCollection#entitywithdefaultvaluedouble)

- [WithDefaultValueFloat](./v2-Collection-CreateCollection#entitywithdefaultvaluefloat)

- [WithDefaultValueInt](./v2-Collection-CreateCollection#entitywithdefaultvalueint)

- [WithDefaultValueLong](./v2-Collection-CreateCollection#entitywithdefaultvaluelong)

- [WithDefaultValueString](./v2-Collection-CreateCollection#entitywithdefaultvaluestring)

- [WithDescription](./v2-Collection-CreateCollection#entitywithdescription)

- [WithDim](./v2-Collection-CreateCollection#entitydim)

- [WithElementType](./v2-Collection-CreateCollection#entitywithelementtype)

- [WithEnableAnalyzer](./v2-Collection-CreateCollection#entitywithenableanalyzer)

- [WithIsAutoID](./v2-Collection-CreateCollection#entitywithisautoid)

- [WithIsClusteringKey](./v2-Collection-CreateCollection#entitywithisclusteringkey)

- [WithIsDynamic](./v2-Collection-CreateCollection#entitywithisdynamic)

- [WithIsPartitionKey](./v2-Collection-CreateCollection#entitywithispartitionkey)

- [WithIsPrimaryKey](./v2-Collection-CreateCollection#entitywithisprimarykey)

- [WithMaxCapacity](./v2-Collection-CreateCollection#entitywithmaxcapacity)

- [WithMaxLength](./v2-Collection-CreateCollection#entitywithmaxlength)

- [WithName](./v2-Collection-CreateCollection#entitywithname)

- [WithNullable](./v2-Collection-CreateCollection#entitywithnullable)

- [WithTypeParams](./v2-Collection-CreateCollection#entitywithtypeparams)

### entity.WithAnalyzerParams{#entitywithanalyzerparams}

This method appends analyzer parameters in key-value pairs to the `entity.Field` struct. The signature of the method is as follows:

```go
func (f *Field) WithAnalyzerParams(params map[string]any) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Analyzer parameters of the current field in key-value pairs.</p><p>An <strong>analyzer</strong> is a crucial component that converts raw text into a structured, searchable format. For details, refer to <a href="/docs/analyzer-overview">Analyzer Overview</a>.</p></td>
     <td><p><code>map[string]any</code></p></td>
   </tr>
</table>

### entity.WithDataType{#entitywithdatatype}

This method appends the data type property to the `entity.Field` struct. The signature of the method is as follows:

```javascript
func (f *Field) WithDataType(dataType FieldType) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>dataType</code></p></td>
     <td><p>Data type of the current field. Possible values are as follows:</p><ul><li><p><code>entity.FieldTypeBool</code></p></li><li><p><code>entity.FieldTypeInt8</code></p></li><li><p><code>entity.FieldTypeInt16</code></p></li><li><p><code>entity.FieldTypeInt32</code></p></li><li><p><code>entity.FieldTypeInt64</code></p></li><li><p><code>entity.FieldTypeFloat</code></p></li><li><p><code>entity.FieldTypeDouble</code></p></li><li><p><code>entity.FieldTypeVarChar</code></p></li><li><p><code>entity.FieldTypeArray</code></p></li><li><p><code>entity.FieldTypeJSON</code></p></li><li><p><code>entity.FieldTypeBinaryVector</code></p></li><li><p><code>entity.FieldTypeFloatVector</code></p></li><li><p><code>entity.FieldTypeFloat16Vector</code></p></li><li><p><code>entity.FieldTypeBFloat16Vector</code></p></li><li><p><code>entity.FieldTypeSparseVector</code></p></li><li><p><code>entity.FieldTypeInt8Vector</code></p></li></ul></td>
     <td><p><code>entity.FieldType</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueBool{#entitywithdefaultvaluebool}

This method sets the default value for the field of the `entity.FieldTypeBool` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueBool(defaultValue bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeBool</code>.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueDouble{#entitywithdefaultvaluedouble}

This method sets the default value for the field of the `entity.FieldTypeDouble` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueDouble(defaultValue float64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeDouble</code>.</p></td>
     <td><p><code>float64</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueFloat{#entitywithdefaultvaluefloat}

This method sets the default value for the field of the `entity.FieldTypeFloat` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueFloat(defaultValue float32) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeFloat</code>.</p></td>
     <td><p><code>float32</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueInt{#entitywithdefaultvalueint}

This method sets the default value for the field of the `entity.FieldTypeLong` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueInt(defaultValue int64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeLong</code>.</p></td>
     <td><p><code>int32</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueLong{#entitywithdefaultvaluelong}

This method sets the default value for the field of the `entity.FieldTypeInt` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueLong(defaultValue int64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeInt</code>.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

### entity.WithDefaultValueString{#entitywithdefaultvaluestring}

This method sets the default value for the field of the `entity.FieldTypeVarChar` type. The signature of the method is as follows:

```go
func (f *Field) WithDefaultValueString(defaultValue string) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>defaultValue</code></p></td>
     <td><p>Default value when the argument of the <code>entity.WithDataType</code> method is set to <code>entity.FieldTypeVarChar</code>.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### entity.WithDescription{#entitywithdescription}

This method sets the field description. The signature of the method is as follows:

```go
func (f *Field) WithDescription(desc string) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>desc</code></p></td>
     <td><p>Description of the field.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### entity.Dim{#entitydim}

This method sets the dimensionality for a vector field. The signature of the method is as follows:

```go
func (f *Field) WithDim(dim int64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>dim</code></p></td>
     <td><p>Dimensionality of a vector field</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

### entity.WithElementType{#entitywithelementtype}

This methods set the data type for the elements in an array field. The signature of the method is as follows:

```go
func (f *Field) WithElementType(eleType FieldType) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>eleType</code></p></td>
     <td><p>Data type for the elements in an array field. Possible values are as follows:</p><ul><li><p><code>entity.FieldTypeBool</code></p></li><li><p><code>entity.FieldTypeInt8</code></p></li><li><p><code>entity.FieldTypeInt16</code></p></li><li><p><code>entity.FieldTypeInt32</code></p></li><li><p><code>entity.FieldTypeInt64</code></p></li><li><p><code>entity.FieldTypeFloat</code></p></li><li><p><code>entity.FieldTypeDouble</code></p></li><li><p><code>entity.FieldTypeVarChar</code></p></li></ul></td>
     <td><p><code>entity.FieldType</code></p></td>
   </tr>
</table>

### entity.WithEnableAnalyzer{#entitywithenableanalyzer}

This method determines whether to enable the analyzer for the current field. The signature of the method is as follows:

```go
func (f *Field) WithEnableAnalyzer(enable bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>enable</code></p></td>
     <td><p>Whether to enable the analyzer for the current field.</p><p>An <strong>analyzer</strong> is a crucial component that converts raw text into a structured, searchable format. For details, refer to <a href="/docs/analyzer-overview">Analyzer Overview</a>.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithIsAutoID{#entitywithisautoid}

This method determines whether the primary key automatically increments. The signature of the method is as follows：

```go
func (f *Field) WithIsAutoID(isAutoID bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>autoID</code></p></td>
     <td><p>Whether the primary key automatically increments.</p><p>This method applies only when you also append the <code>entity.WithIsPrimaryKey</code> to the field creation request.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithIsClusteringKey{#entitywithisclusteringkey}

This method determines whether the current field serves as the clustering key, which guides Milvus to implement clustering compaction. For details, refer to [Clustering Compaction](https://milvus.io/docs/clustering-compaction.md). The signature of the method is as follows:

```go
func (f *Field) WithIsClusteringKey(isClusteringKey bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>isClusteringKey</code></p></td>
     <td><p>Whether the current field serves as the cluster key.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithIsDynamic{#entitywithisdynamic}

This method determines whether the current field serves as the dynamic field. 

A dynamic field should be a field of the JSON type and you can store non-schema-defined fields and their values in key-value pairs in it. For details, refer to [Dynamic Field](/docs/enable-dynamic-field).

The signature of this method is as follows:

```go
func (f *Field) WithIsDynamic(isDynamic bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>isDynamic</code></p></td>
     <td><p>Whether the current field serves as the dynamic field.</p><p>This method applies only when you also append the <code>entity.WithDataType</code> method to the field creation request and set the <code>dataType</code> parameter to <code>entity.FieldTypeJSON</code>.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithIsPartitionKey{#entitywithispartitionkey}

This method determines whether the current field serves as the partition key.

A partition key serves as a guidance for Zilliz Cloud to determine how to allocate the incoming entities. For details, refer to [Use Partition Key](/docs/use-partition-key).

The signature of this method is as follows:

```go
func (f *Field) WithIsPartitionKey(isPartitionKey bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>isPartitionKey</code></p></td>
     <td><p>Whether the current field serves as the partition key.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithIsPrimaryKey{#entitywithisprimarykey}

This method determines whether the current field serves as the primary key. The signature of this method is as follows:

```go
func (f *Field) WithIsPrimaryKey(isPrimaryKey bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>isPrimaryKey</code></p></td>
     <td><p>Whether the current field serves as the primary key.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithMaxCapacity{#entitywithmaxcapacity}

This method sets the maximum number of elements in an array field. The signature of this method is as follows:

```go
func (f *Field) WithMaxCapacity(maxCap int64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>maxCap</code></p></td>
     <td><p>Maximum number of elements in an array field.</p><p>This method applies only when you also append the <code>entity.WithDataType</code> method to the field creation request and set the <code>dataType</code> parameter to <code>entity.FieldTypeArray</code>.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

### entity.WithMaxLength{#entitywithmaxlength}

This method sets the maximum length of a VarChar field. The signature of this method is as follows:

```go
func (f *Field) WithMaxLength(maxLen int64) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>maxCap</code></p></td>
     <td><p>Maximum length of a VarChar field.</p><p>This method applies only when you also append the <code>entity.WithDataType</code> method to the field creation request and set the <code>dataType</code> parameter to <code>entity.FieldTypeVarChar</code>.</p></td>
     <td><p><code>int64</code></p></td>
   </tr>
</table>

### entity.WithName{#entitywithname}

This method sets the name of the current field. The signature of this method is as follows:

```go
func (f *Field) WithName(name string) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the current field.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### entity.WithNullable{#entitywithnullable}

This method determines whether the current field allows null values. The signature of this method is as follows:

```go
func (f *Field) WithNullable(nullable bool) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>nullable</code></p></td>
     <td><p>Whether the current field allows null values.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
</table>

### entity.WithTypeParams{#entitywithtypeparams}

This method sets additional parameters for specific data types in a key-value pair. The signature of this method is as follows:

```go
func (f *Field) WithTypeParams(key string, value string) *Field
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>key</code></p></td>
     <td><p>Name of the parameter to set</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>value</code></p></td>
     <td><p>Value of the specified parameter</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

## entity.Function{#entityfunction}

You can use the `entity.NewFunction` method to get the concrete implementation of the `entity.Funtion` struct type.

### entity.NewFunction{#entitynewfunction}

This method creates an empty function. You can chain the following methods to append corresponding parameters to the created field schema.

- [WithInputFields](./v2-Collection-CreateCollection#entitywithinputfields)

- [WithName](./v2-Collection-CreateCollection#entityname)

- [WithOutputFields](./v2-Collection-CreateCollection#entitywithoutputfields)

- [WithParam](./v2-Collection-CreateCollection#entitywithparam)

- [WithType](./v2-Collection-CreateCollection#entitytype)

### entity.WithInputFields{#entitywithinputfields}

This method specifies the input field names. The data contained in the specified input field requires conversion to vector representation.

```go
func (f *Function) WithInputFields(inputFields ...string) *Function
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>inputFields</code></p></td>
     <td><p>Names of the fields that contain the data to be converted to its vector representation.</p></td>
     <td><p><code>...string</code></p></td>
   </tr>
</table>

### entity.Name{#entityname}

This method specifies the name of the function.

```go
func (f *Function) WithName(name string) *Function
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>Name of the current function.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
</table>

### entity.WithOutputFields{#entitywithoutputfields}

This method specifies the output field name. Milvus calls the function to create the output field and insert the vector representation of the data in the specified input field.

```go
func (f *Function) WithOutputFields(outputFields ...string) *Function
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>outputFields</code></p></td>
     <td><p>Names of the fields to create after you call the function.</p></td>
     <td><p><code>...string</code></p></td>
   </tr>
</table>

### entity.WithParam{#entitywithparam}

This method adds an additional parameter to the current function.

```go
func (f *Function) WithParam(key string, value any) *Function
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>key</code></p></td>
     <td><p>Name of the additional parameter.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>value</code></p></td>
     <td><p>Value of the additional parameter.</p></td>
     <td><p><code>any</code></p></td>
   </tr>
</table>

### entity.Type{#entitytype}

This method specifies the type of the current function.

```go
func (f *Function) WithType(funcType FunctionType) *Function
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>funcType</code></p></td>
     <td><p>Type of the current function.</p></td>
     <td><p><code>FunctionType</code></p></td>
   </tr>
</table>

## entity.ConsistencyLevel{#entityconsistencylevel}

This is a private type that has the following possible values.

```go
const (
        ClStrong ConsistencyLevel = ConsistencyLevel(commonpb.ConsistencyLevel_Strong)
        ClBounded ConsistencyLevel = ConsistencyLevel(commonpb.ConsistencyLevel_Bounded)
        ClSession ConsistencyLevel = ConsistencyLevel(commonpb.ConsistencyLevel_Session)
        ClEventually ConsistencyLevel = ConsistencyLevel(commonpb.ConsistencyLevel_Eventually)
        ClCustomized ConsistencyLevel = ConsistencyLevel(commonpb.ConsistencyLevel_Customized)
)
```

## entity.MetricType{#entitymetrictype}

This is a string type that has the following possible values:

```go
const (
        L2             MetricType = "L2"
        IP             MetricType = "IP"
        COSINE         MetricType = "COSINE"
        HAMMING        MetricType = "HAMMING"
        JACCARD        MetricType = "JACCARD"
        TANIMOTO       MetricType = "TANIMOTO"
        SUBSTRUCTURE   MetricType = "SUBSTRUCTURE"
        SUPERSTRUCTURE MetricType = "SUPERSTRUCTURE"
        BM25           MetricType = "BM25"
)
```

## entity.FunctionType{#entityfunctiontype}

This is a private type that has the following possible values.

```go
const (
        FunctionTypeUnknown       = schemapb.FunctionType_Unknown
        FunctionTypeBM25          = schemapb.FunctionType_BM25
        FunctionTypeTextEmbedding = schemapb.FunctionType_TextEmbedding
        FunctionTypeRerank        = schemapb.FunctionType_Rerank
)
```

## Return{#return}

Null

## Example{#example}

- Quick setup

    ```go
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    collectionName := `quick_setup_1`
    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: milvusAddr,
    })
    if err != nil {
        // handle err
    }
    
    err = cli.CreateCollection(ctx, milvusclient.SimpleCreateCollectionOptions(collectionName, 512))
    if err != nil {
        // handle error
    }
    ```

- Custom setup with index parameters

    ```go
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    collectionName := `quick_setup_2`
    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: milvusAddr,
    })
    if err != nil {
        // handle err
    }
    
    err = cli.CreateCollection(ctx, milvusclient.SimpleCreateCollectionOptions(collectionName, 512).WithIndexOptions(
        milvusclient.NewCreateIndexOption(collectionName, "vector", index.NewHNSWIndex(entity.L2, 64, 128)),
    ))
    if err != nil {
        log.Println(err.Error())
        // handle error
    }
    ```

- Custom setup without index parameters

    ```go
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    collectionName := `quick_setup_3`
    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: milvusAddr,
    })
    if err != nil {
        // handle err
    }
    
    err = cli.CreateCollection(ctx, milvusclient.SimpleCreateCollectionOptions(collectionName, 512).
        WithVarcharPK(true, 64).
        WithShardNum(1),
    )
    if err != nil {
        log.Println(err.Error())
        // handle error
    }
    ```

    