| Capability | Limit |
| --- | --- |
| Nullable StructArray field | Subject to the availability statement below, set `nullable=True` on the StructArray parent; do not configure Struct subfields as nullable independently. |
| NULL value in Python | Use `None` to insert a null StructArray value in Python. Do not use `Null` or `null`. |
| Null scope | NULL applies to the whole StructArray field. For example, `chunks=None` is valid only when `chunks` is nullable. |
| Partially null StructArray value | When a StructArray field contains a valid array value, do not mix null subfield arrays with valid subfield arrays in the same value. |
| Element-level null | Supported. A scalar, vector, or `ARRAY` subfield can allow a null value in individual Struct elements: `nullable=True` on a scalar or vector subfield, `element_nullable=True` on an `ARRAY` subfield. The row-level `nullable` setting still comes from the StructArray parent; setting `nullable=True` on a subfield enables element-level null, not row-level null. |
| Null Struct element | A Struct element itself cannot be null, such as `[null, {...}]`. Set the subfield values of the element to null instead. |
| Omitted subfields | You can omit an element-nullable subfield from a Struct element, and Zilliz Cloud stores null for it. A subfield that is not element-nullable must be present in every Struct element. |
| Dynamic add StructArray field | Subject to the availability statement below. |
| Nullable requirement for dynamic add | A StructArray field added to an existing collection must be nullable because existing entities have no value for the new field. |
| Existing entities after dynamic add | Existing entities return `null` for the added StructArray field. |
| Dynamic add subfield | Supported. An added subfield must be created with `nullable=True`; an added `ARRAY` subfield additionally takes `element_nullable=True` for null values inside the inner array. Existing entities return null for the new subfield in each of their Struct elements, and entities whose StructArray field is null stay null. Existing subfields cannot be changed to `element_nullable` afterward. |
