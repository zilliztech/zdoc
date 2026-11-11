<div class="alert note">

NULL applies to the whole StructArray field. Do not configure individual Struct subfields as row-level nullable independently. When supplying a valid StructArray value, do not mix null subfield arrays with valid subfield arrays. A Struct element itself cannot be null. Element-nullable subfields can hold null values in individual Struct elements; see the next section. For details, see [StructArray Limits](structarray-limits.md).

</div>
