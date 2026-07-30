---
title: "Geometry Operators | Cloud"
slug: /geometry-operators
sidebar_label: "Geometry"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports a set of operators for spatial filtering on `GEOMETRY` fields, which are essential for managing and analyzing geometric data. These operators allow you to retrieve entities based on the geometric relationships between objects. | Cloud"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Geometry Operators

Zilliz Cloud supports a set of operators for spatial filtering on `GEOMETRY` fields, which are essential for managing and analyzing geometric data. These operators allow you to retrieve entities based on the geometric relationships between objects.

All geometry operators function by taking two geometric arguments: the name of the `GEOMETRY` field defined in your collection schema and a target geometry object represented in [Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) (WKT) format.

## Use syntax\{#use-syntax}

To filter on a `GEOMETRY` field, use a geometry operator in an expression:

- General: `{operator}(geo_field, '{wkt}')`

- Distance-based: `ST_DWITHIN(geo_field, '{wkt}', distance)`

Where:

- `operator` is one of the supported geometry operators (e.g., `ST_CONTAINS`, `ST_INTERSECTS`). Operator names must be all uppercase or all lowercase. For a list of supported operators, refer to [Supported geometry operators](./geometry-operators#supported-geometry-operators).

- `geo_field` is the name of your `GEOMETRY` field.

- `'{wkt}'` is the WKT representation of the geometry to query.

- `distance` is the threshold specifically for `ST_DWITHIN`.

To learn more about `GEOMETRY` fields in Zilliz Cloud, refer to [Geometry Field](./use-geometry-field).

## Supported geometry operators\{#supported-geometry-operators}

The following table lists the geometry operators available in Zilliz Cloud.

<Admonition type="info" icon="📘" title="Notes">

Operator names must be **all uppercase** or **all lowercase**. Do not mix cases within the same operator name.

</Admonition>

| Operator | Description | Example |
| --- | --- | --- |
| `ST_EQUALS(A, B)` / `st_equals(A, B)` | Returns TRUE if two geometries are spatially identical, meaning they have the same set of points and dimension. | Are two geometries (A and B) exactly the same in space? |
| `ST_CONTAINS(A, B)` / `st_contains(A, B)` | Returns TRUE if geometry A completely contains geometry B, with their interiors having at least one point in common. | Is a city boundary (A) containing a specific park (B)? |
| `ST_CROSSES(A, B)` / `st_crosses(A, B)` | Returns TRUE if geometries A and B partially intersect but do not fully contain each other. | Do two roads (A and B) cross at an intersection? |
| `ST_INTERSECTS(A, B)` / `st_intersects(A, B)` | Returns TRUE if geometries A and B have at least one common point. This is the most general and widely used spatial query. | Does a search area (A) intersect with any of the store locations (B)? |
| `ST_OVERLAPS(A, B)` / `st_overlaps(A, B)` | Returns TRUE if geometries A and B are of the same dimension, partially overlap, and neither fully contains the other. | Do two land plots (A and B) overlap? |
| `ST_TOUCHES(A, B)` / `st_touches(A, B)` | Returns TRUE if geometries A and B share a common boundary but their interiors do not intersect. | Do two neighboring properties (A and B) share a border? |
| `ST_WITHIN(A, B)` / `st_within(A, B)` | Returns TRUE if geometry A is completely contained within geometry B, with their interiors having at least one point in common. It's the inverse of `ST_Contains(B, A)`. | Is a specific point of interest (A) within a defined search radius (B)? |
| `ST_DWITHIN(A, B, distance)` / `st_dwithin(A, B, distance)` | Returns TRUE if the distance between geometry A and geometry B is less than or equal to the specified distance.<br/>**Note**: Geometry B currently only supports points. The distance unit is meters. | Find all points within 5000 meters of a specific point (B). |

## ST_EQUALS / st_equals\{#stequals-stequals}

The `ST_EQUALS` operator returns TRUE if two geometries are spatially identical, meaning they have the same set of points and dimension. This is useful for verifying if two stored geometry objects represent exactly the same location and shape.

**Example**

Suppose you want to check whether a stored geometry (such as a point or polygon) is exactly the same as a target geometry. For instance, you can compare a stored point to a specific point of interest.

```python
# The filter expression to check if a geometry matches a specific point
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

The `ST_CONTAINS` operator returns TRUE if the first geometry completely contains the second geometry. This is useful for finding points within a polygon, or smaller polygons within a larger one.

**Example**

Imagine you have a collection of city districts and want to find a specific point of interest, such as a restaurant, that falls within the boundaries of a given district.

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

The `ST_CROSSES` operator returns `TRUE` if the intersection of two geometries forms a geometry with a lower dimension than the original geometries. This typically applies to a line crossing a polygon or another line.

**Example**

You want to find all hiking trails (line strings) that cross a specific boundary line (another line string) or enter a protected area (polygon).

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

The `ST_INTERSECTS` operator returns `TRUE` if two geometries have any point of their boundaries or interiors in common. This is a general-purpose operator for detecting any form of spatial overlap.

**Example**

If you have a collection of roads and want to find all roads that cross or touch a specific line string representing a proposed new road, you can use `ST_INTERSECTS`.

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

The `ST_OVERLAPS` operator returns `TRUE` if two geometries of the same dimension have a partial intersection, where the intersection itself has the same dimension as the original geometries, but is not equal to either of them.

**Example**

You have a set of overlapping sales regions and want to find all regions that partially overlap with a new proposed sales zone.

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

The `ST_TOUCHES` operator returns `TRUE` if two geometries' boundaries touch, but their interiors do not intersect. This is useful for detecting adjacencies.

**Example**

If you have a map of property parcels and want to find all parcels that are directly adjacent to a public park without any overlap.

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

The `ST_WITHIN` operator returns `TRUE` if the first geometry is completely within the interior or on the boundary of the second geometry. It is the inverse of `ST_CONTAINS`.

**Example**

You want to find all small residential areas that are located entirely within a larger designated park area.

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

For more information on how to use a `GEOMETRY` field, refer to [Geometry Field](./use-geometry-field).

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

The `ST_DWITHIN` operator returns `TRUE` if the distance between geometry A and geometry B is less than or equal to a specified value (in meters). Currently, geometry B must be a point.

**Example**

Suppose you have a collection of store locations and want to find all stores within 5,000 meters of a specific customer’s location.

```python
# Find all stores within 5000 meters of the point (120 30)
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```
