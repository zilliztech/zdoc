---
title: "createCollection() | Java | v1"
slug: /java/v1-Collection-createCollection
sidebar_label: "createCollection()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法使用指定的 schema 创建集合。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#BP2HdEqGKoCZgYx39WOcGbCvn5g
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createCollection()

MilvusClient 接口。此方法使用指定的 schema 创建集合。

```java
R<RpcStatus> createCollection(CreateCollectionParam requestParam);
```

#### CreateCollectionParam\{#createcollectionparam}

使用 `CreateCollectionParam.Builder` 构建 `CreateCollectionParam` 对象。

```java
import io.milvus.param.CreateCollectionParam;
CreateCollectionParam.Builder builder = CreateCollectionParam.newBuilder();
```

`CreateCollectionParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionName(String collectionName)</p></td>
        <td><p>设置集合名称。集合名称不能为空或 null。</p></td>
        <td><p>collectionName: 要创建的集合名称。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。对于默认数据库，database name 可以为 null。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withShardsNum(int shardsNum)</p></td>
        <td><p>设置分片数。该值必须大于或等于零。<br/>默认值为 0，表示由服务器决定具体值。如果用户未指定，服务器会将该值设置为 1。</p></td>
        <td><p>shardsNum: 将插入数据拆分到的分片数量。多个分片会由 Milvus 中的多个节点处理。</p></td>
    </tr>
    <tr>
        <td><p>withDescription(String description)</p></td>
        <td><p>设置集合描述。描述可以为空。默认描述为 ""。</p></td>
        <td><p>description: 要创建的集合描述。</p></td>
    </tr>
    <tr>
        <td><p>withFieldTypes(List\<FieldType> fieldTypes)</p></td>
        <td><p>设置集合 schema。集合 schema 不能为空。</p></td>
        <td><p>fieldTypes: 由 FieldType 对象组成的列表，每个对象表示一个字段 schema。</p></td>
    </tr>
    <tr>
        <td><p>addFieldType(FieldType fieldType)</p></td>
        <td><p>添加一个字段 schema。</p></td>
        <td><p>fieldType: 要添加到集合中的字段 schema。</p></td>
    </tr>
    <tr>
        <td><p>withSchema(CollectionSchemaParam schema)</p></td>
        <td><p>设置集合 schema。建议使用此方法，而不是 withFieldTypes()</p></td>
        <td><p>schema: 集合 schema</p></td>
    </tr>
    <tr>
        <td><p>withConsistencyLevel(ConsistencyLevelEnum consistencyLevel)</p></td>
        <td><p>设置一致性级别。默认值为 ConsistencyLevelEnum.BOUNDED</p></td>
        <td><p>consistencyLevel: 此集合的一致性级别</p></td>
    </tr>
    <tr>
        <td><p>withPartitionsNum(int partitionsNum)</p></td>
        <td><p>如果存在分区键字段，则设置分区数量。该值必须大于零。<br/>默认值为 64（在服务端定义）。上限为 4096（在服务端定义）。<br/>如果没有任何字段是分区键，则不允许设置该值。一个集合中只允许有一个分区键字段。</p></td>
        <td><p>partitionsNum: 如果集合中存在分区键字段，则定义分区数量。</p></td>
    </tr>
    <tr>
        <td><p>withReplicaNumber(int replicaNumber)</p></td>
        <td><p>在集合级别设置副本数量。这样如果加载集合时未指定副本数量，将使用此副本数量。</p></td>
        <td><p>replicaNumber: 为此集合设置默认副本数量。</p></td>
    </tr>
    <tr>
        <td><p>withResourceGroups(List\<String> resourceGroups)</p></td>
        <td><p>在集合级别设置资源组。这样如果加载集合时未指定资源组，将使用这些资源组。</p></td>
        <td><p>resourceGroups: 资源组名称</p></td>
    </tr>
    <tr>
        <td><p>withProperty(String key, String value)</p></td>
        <td><p>用于设置键值属性的基础方法。<br/>你可以使用此方法为该集合设置 ttl 或 mmap。withReplicaNumber() 和 withResourceGroups() 实际上也是调用此方法来传递属性。</p></td>
        <td><p>key: 属性键。 <br/>可选值：<br/>- Constant.TTL_SECONDS<br/>- Constant.MMAP_ENABLED<br/>- Constant.COLLECTION_REPLICA_NUMBER<br/>- Constant.COLLECTION_RESOURCE_GROUPS<br/>value: 属性值。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建 CreateCollectionParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreateCollectionParam.Builder.build()` 可能抛出以下异常：

- ParamException: 当参数无效时抛出错误。

#### FieldType\{#fieldtype}

用于表示字段 schema 的工具类。使用 `FieldType.Builder` 构建 `FieldType` 对象。

```java
import io.milvus.param.FieldType;
FieldType.Builder builder = FieldType.newBuilder();
FieldType ft = builder.build()
```

`FieldType.Builder` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
   </tr>
   <tr>
     <td><p>withName(String name)</p></td>
     <td><p>设置字段名称。名称不能为空或 null。</p></td>
     <td><p>name: 字段名称。</p></td>
   </tr>
   <tr>
     <td><p>withPrimaryKey(boolean primaryKey)</p></td>
     <td><p>将字段设置为主键字段。只有数据类型为 INT64 或 VARCHAR 的字段才能设置为主键字段。默认值为 false。</p></td>
     <td><p>primaryKey: 一个布尔值，用于定义该字段是否为主键字段。值为 true 表示该字段是主键字段，值为 false 表示不是。</p></td>
   </tr>
   <tr>
     <td><p>withDescription(String description)</p></td>
     <td><p>设置字段描述。描述可以为空。默认值为空字符串。</p></td>
     <td><p>description: 字段描述。</p></td>
   </tr>
   <tr>
     <td><p>withDataType(DataType dataType)</p></td>
     <td><p>设置字段的数据类型。请参阅 Misc 中的 DataType。</p></td>
     <td><p>dataType: 字段的数据类型。</p></td>
   </tr>
   <tr>
     <td><p>withElementType(DataType elementType)</p></td>
     <td><p>为 Array 类型字段设置元素类型。</p><p>Array 的有效元素类型包括：Int8、Int16、Int32、Int64、Varchar、Bool、Float、Double</p></td>
     <td><p>elementType: 数组的元素类型。</p></td>
   </tr>
   <tr>
     <td><p>addTypeParam(String key, String value)</p></td>
     <td><p>为字段添加一个参数键值对。主要用于为向量字段和 varchar 字段设置额外参数。</p></td>
     <td><p>key: 参数键。</p><p>value: 参数值。</p></td>
   </tr>
   <tr>
     <td><p>withDimension(Integer dimension)</p></td>
     <td><p>设置向量字段的维度。维度值必须大于零。此方法在内部调用 addTypeParam() 来存储维度值。</p></td>
     <td><p>dimension: 向量字段的维度。</p></td>
   </tr>
   <tr>
     <td><p>withMaxLength(Integer maxLength)</p></td>
     <td><p>设置 Varchar 字段的最大长度。该值必须大于零。此方法在内部调用 addTypeParam() 来存储最大长度值。</p></td>
     <td><p>maxLength: varchar 字段的最大长度。</p></td>
   </tr>
   <tr>
     <td><p>withMaxCapacity(Integer maxCapacity)</p></td>
     <td><p>设置 Array 字段的最大容量。</p><p>有效容量取值范围为 [1, 4096]</p></td>
     <td><p>maxCapacity: 数组的最大容量。</p></td>
   </tr>
   <tr>
     <td><p>withAutoID(boolean autoID)</p></td>
     <td><p>为字段启用 auto-ID 功能。请注意，auto-ID 功能只能在主键字段上启用。</p><p>如果启用了 auto-ID 功能，Milvus 会为每个实体自动生成唯一 ID，因此在插入数据时无需为主键字段提供值。如果禁用了 auto-ID，则在插入数据时需要为主键字段提供值。</p></td>
     <td><p>autoID: 一个布尔值，用于定义主键是否自动生成。值为 true 表示启用 auto-ID，值为 false 表示不启用。</p></td>
   </tr>
   <tr>
     <td><p>withPartitionKey(boolean partitionKey)</p></td>
     <td><p>将字段设置为分区键。</p><p>分区键字段的值会经过哈希处理并分布到不同的逻辑分区中。</p><p>只有 int64 和 varchar 类型字段可以作为分区键。主键字段不能作为分区键。</p></td>
     <td><p>partitionKey: 一个布尔值，用于定义该字段是否为分区键字段。值为 true 表示是分区键，false 表示不是。</p></td>
   </tr>
   <tr>
     <td><p>build()</p></td>
     <td><p>创建一个 FieldType 对象。</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

#### CollectionSchemaParam\{#collectionschemaparam}

用于表示集合 schema 的工具类。使用 `CollectionSchemaParam.Builder` 构建 `CollectionSchemaParam` 对象。

```java
import io.milvus.param.collection.CollectionSchemaParam;
CollectionSchemaParam.Builder builder = CollectionSchemaParam.newBuilder();
```

`CollectionSchemaParam.Builder` 的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
   </tr>
   <tr>
     <td><p>withEnableDynamicField(boolean enableDynamicField)</p></td>
     <td><p>设置集合是否启用 enableDynamicField。</p></td>
     <td><p>enableDynamicField: 集合的 enableDynamicField</p></td>
   </tr>
   <tr>
     <td><p>withFieldTypes(List\<FieldType> fieldTypes)</p></td>
     <td><p>设置 schema 的 fieldTypes。fieldTypes 不能为空或 null。</p></td>
     <td><p>fieldTypes: 用于定义字段的 FieldType 列表。</p></td>
   </tr>
   <tr>
     <td><p>addFieldType( FieldType fieldType)</p></td>
     <td><p>添加一个字段 schema。</p></td>
     <td><p>fieldType: 一个字段 schema。</p></td>
   </tr>
   <tr>
     <td><p>build()</p></td>
     <td><p>创建一个 CollectionSchemaParam 对象。</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

List<FieldType> fieldsSchema = new ArrayList<>();
FieldType field_1 = FieldType.newBuilder()
        .withPrimaryKey(true)
        .withAutoID(false)
        .withDataType(DataType.Int64)
        .withName("uid")
        .withDescription("unique id")
        .build();

fieldsSchema.add(field_1);

FieldType field_2 = FieldType.newBuilder()
        .withDataType(DataType.FloatVector)
        .withName("embedding")
        .withDescription("embeddings")
        .withDimension(dimension)
        .build();
fieldsSchema.add(field_2);

// create collection
CreateCollectionParam param = CreateCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withDescription("a collection for search")
        .withFieldTypes(fieldsSchema)
        .build();

R<RpcStatus> response = client.createCollection(param);
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
