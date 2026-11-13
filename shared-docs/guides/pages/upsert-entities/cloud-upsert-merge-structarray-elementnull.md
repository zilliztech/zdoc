
Upserting a StructArray field in an entity overwrites the field value. That means you need to include all subfields defined in the struct schema when you upsert a StructArray field. On Dedicated Clusters compatible with Milvus v3.0.x, element-nullable subfields can be omitted or set to `None` in a Struct element, and {{var.product_name}} stores null for them; upsert into collections that contain StructArray fields is not yet available on On-Demand Clusters, where bulk import is the only write path for StructArray data. A request that still carries a dropped subfield is rejected.

pymilvus can also replace part of a StructArray value. Pass `field_ops` to `upsert()` with `FieldOp.path_replace()`: a path such as `[1][lang]` replaces one subfield of one Struct element and preserves the other Struct elements and subfields, and a path such as `[1]` replaces one whole Struct element. A child path carries only the selected subfield, and every operand must explicitly include its keys. A whole-element path requires every subfield that is not element-nullable and sets omitted element-nullable subfields to null.

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="tech_articles",
    data=[
        {
            "doc_id": 1,
            "chunks": [{"lang": "zh"}],
        }
    ],
    field_ops={"chunks": FieldOp.path_replace("[1][lang]")},
)
```

