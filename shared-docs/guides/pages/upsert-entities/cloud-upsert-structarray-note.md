
- **Upsert a StructArray field.**

    Upserting a StructArray field in an entity overwrites the field value. To do so, you need to provide a list of dictionaries, each of which contains all subfields defined in the struct schema, even when you perform the upsert in merge mode. On Dedicated Clusters compatible with Milvus v3.0.x, you can omit element-nullable subfields; {{var.product_name}} stores null for them in that Struct element. Upsert into collections that contain StructArray fields is not yet available on On-Demand Clusters, where bulk import is the only write path for StructArray data.

    For details, refer to [Upsert StructArray field in merge mode](upsert-entities.md#Upsert-StructArray-field-in-merge-mode).

