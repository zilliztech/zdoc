### Add a subfield to an existing StructArray field

You can add a subfield to a StructArray field that already holds data. Call `add_collection_field()` with the subfield path as the field name and set `nullable=True` on the new subfield (required for every added subfield, and what allows element-level null). On an array subfield, additionally set `element_nullable=True` to allow null values inside the inner array. The new subfield inherits the row-level `nullable` setting and the `max_capacity` of the StructArray field.
