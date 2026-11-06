<table>
   <tr>
     <th><p>Property</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>If the data of a collection needs to be deleted after a specific period, consider setting its Time-To-Live (TTL) in seconds. Once the TTL times out, {{var.product_name}} deletes all entities from the collection.</p><p>The deletion is asynchronous, indicating that searches and queries are still possible before the deletion is complete.</p><p>For details, refer to <a href="set-collection-ttl.md">Set collection-level TTL</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>ttl_field</code></p></td>
     <td><p>Name of the <code>TIMESTAMPTZ</code> field that stores each entity's absolute expiration timestamp (<strong>entity-level TTL</strong>). Each entity expires exactly when wall-clock time reaches the value stored in this field; a <code>NULL</code> in the field means the entity never expires. Mutually exclusive with <code>collection.ttl.seconds</code>.</p><p>For details, refer to <a href="set-collection-ttl.md">Set entity-level TTL</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>Memory mapping (Mmap) enables direct memory access to large files on disk, allowing {{var.product_name}} to store indexes and data in both memory and hard drives. This approach helps optimize data placement policy based on access frequency, expanding storage capacity for collections without impacting search performance.</p><p>{{var.product_name}} implements global mmap settings for your clusters. You can change the settings on a specific field or its index.</p><p>For details, refer to <a href="mmap.md">Use mmap</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>partitionkey.isolation</code></p></td>
     <td><p>With Partition Key Isolation enabled, {{var.product_name}} groups entities based on the Partition Key value and creates a separate index for each of these groups. Upon receiving a search request, {{var.product_name}} locates the index based on the Partition Key value specified in the filtering condition and restricts the search scope within the entities included in the index, thus avoiding scanning irrelevant entities during the search and greatly enhancing the search performance.</p><p>For details, refer to <a href="use-partition-key.md#Use-Partition-Key-Isolation">Use Partition Key Isolation</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>dynamicfield.enabled</code></p></td>
     <td><p>Enables the dynamic field for collections that were created without enabling it. Once enabled, you can insert entities with fields not defined in the original schema. For details, refer to <a href="enable-dynamic-field.md">Dynamic Field</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>allow_insert_auto_id</code></p></td>
     <td><p>Whether to allow a collection to accept user-provided primary key values when AutoID has been enabled for the collection.</p><ul><li><p>When set to <strong>"true"</strong>: Inserts, upserts, and bulk imports use the user-provided primary key if present; otherwise, primary key values are auto-generated.</p></li><li><p>When set to <strong>"false"</strong>: User-provided primary key values are rejected or ignored and primary key values are always auto-generated. The default is <strong>"false"</strong>.</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>timezone</code></p></td>
     <td><p>Specifies the default timezone for this collection when handling time-sensitive operations, especially <code>TIMESTAMPTZ</code> fields. Timestamps are stored internally in UTC, and {{var.product_name}} converts values for display and comparison according to this setting. If set, the collection timezone overrides the database’s default timezone; a query’s timezone parameter can temporarily override both. The value must be a valid <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">IANA time zone identifier</a> (for example, <strong>Asia/Shanghai</strong>, <strong>America/Chicago</strong>, or <strong>UTC</strong>). For details on how to use a <code>TIMESTAMPTZ</code> field, refer to <a href="timestamptz-field.md">TIMESTAMPTZ Field</a>.</p></td>
   </tr>
</table>
