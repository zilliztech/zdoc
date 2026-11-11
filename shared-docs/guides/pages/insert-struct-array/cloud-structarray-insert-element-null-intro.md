## Insert null values for individual Struct elements

An element-nullable subfield can hold a null value in some Struct elements and a valid value in others. The following example assumes that the `chunks` Struct schema defines a `lang` VARCHAR subfield with `nullable=True` and a `tags` array subfield with `nullable=True` and `element_nullable=True`. For the complete schema definition, see [Allow null values in Struct elements](create-structarray-field.md).
