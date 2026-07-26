---
title: "Geometry 操作符 | BYOC"
slug: /geometry-operators
sidebar_label: "Geometry 操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "支持一组用于在 `GEOMETRY` 字段上进行过滤的运算符，这些运算符对于管理和分析几何数据至关重要。这些运算符能够实现有效的空间查询，使您能够根据对象之间的几何关系检索实体。 | BYOC"
type: origin
token: U0i0wkfowidG7xkkyercDwvKnMf
sidebar_position: 7
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - query
  - 查询
  - filter
  - 过滤
  - 过滤表达式
  - geometry

---

import Admonition from '@theme/Admonition';


# Geometry 操作符

 支持一组用于在 `GEOMETRY` 字段上进行过滤的运算符，这些运算符对于管理和分析几何数据至关重要。这些运算符能够实现有效的空间查询，使您能够根据对象之间的几何关系检索实体。

所有几何运算符都通过采用两个几何参数来运行：集合中定义的 `GEOMETRY` 字段名称和以[众所周知的文本](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）格式表示的目标几何对象。

要了解更多关于 `GEOMETRY` 字段在  中的信息，请参考 [Geometry 类型](./use-geometry-field)。

## 可用的几何运算符

下表总结了  中可用的几何运算符。在**示例**列中，`geo_field` 表示 `GEOMETRY` 字段的名称，该字段在您的集合模式中定义。

<Admonition type="info" icon="📘" title="注释">

<p>操作符名称必须<strong>全部大写</strong>或<strong>全部小写</strong>。不要在同一个操作符名称中混用大小写。</p>

</Admonition>

<table>
   <tr>
     <th><p>操作员</p></th>
     <th><p>描述</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><code>ST_EQUALS</code> / <code>st_equals</code></p></td>
     <td><p>如果两个几何对象在位置和形状上完全相同，则返回 TRUE。</p></td>
     <td><p><code>ST_EQUALS(geo_field, 'POINT(10 20)')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_TOUCHES</code> / <code>st_touches</code></p></td>
     <td><p>如果两个几何对象的边界接触，但内部不重叠，则返回 TRUE。</p></td>
     <td><p><code>ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_OVERLAPS</code> / <code>st_overlaps</code></p></td>
     <td><p>如果两个相同维度的几何对象部分重叠，共享部分但非全部空间，且彼此都不完全包含对方或与之相同，则返回 TRUE。</p></td>
     <td><p><code>ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_CROSSES</code> / <code>st_crosses</code></p></td>
     <td><p>如果两个几何对象的交集产生的几何图形的维度低于两个原始对象（例如，两条线在一个点处相交），则返回 TRUE。</p></td>
     <td><p><code>ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_CONTAINS</code> / <code>st_contains</code></p></td>
     <td><p>如果第一个几何图形完全包含第二个几何图形（包括其边界和内部），则返回 TRUE。</p></td>
     <td><p><code>ST_CONTAINS(geo_field, 'POINT(112 40)')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_INTERSECTS</code> / <code>st_intersects</code></p></td>
     <td><p>如果两个几何图形的边界或内部的任何部分重叠，则返回 TRUE。</p></td>
     <td><p><code>ST_INTERSECTS(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')</code></p></td>
   </tr>
   <tr>
     <td><p><code>ST_WITHIN</code> / <code>st_within</code></p></td>
     <td><p>如果第一个几何图形完全在第二个几何图形内部或边界上，则返回 TRUE。</p></td>
     <td><p><code>ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')</code></p></td>
   </tr>
</table>

## ST_EQUALS / st_equals

如果两个几何图形在空间上完全相同，即它们具有完全相同的位置和维度集合，则 `ST_EQUALS` 运算符返回`TRUE`。

**示例**

你有一组预定义的兴趣点（例如地标），并且你想通过其精确坐标快速找到特定的地标。

```python
# The filter expression to find geometries identical to a specific point.
filter = "ST_EQUALS(geo_field, 'POINT (10 20)')"
```

## ST_TOUCHES / st_touches

如果两个几何图形的边界接触但内部不相交，则 `ST_TOUCHES` 运算符返回 `TRUE`。这对于检测邻接关系很有用。

**示例**

如果你有一份地块地图，并且想要找出所有与公共公园直接相邻且没有任何重叠的地块。

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_OVERLAPS / st_overlaps

如果两个相同维度的几何图形有部分相交，且相交部分的维度与原始几何图形相同，但不等于其中任何一个，则 `ST_OVERLAPS` 运算符返回 `TRUE`。

**示例**

你有一组重叠的销售区域，并且想要找出所有与新提议的销售区域部分重叠的区域。

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_CROSSES / st_crosses

如果两个几何图形的交集形成的几何图形的维度低于原始几何图形，则 `ST_CROSSES` 运算符返回 `TRUE`。这通常适用于一条线穿过一个多边形或另一条线的情况。

**示例**

你想要查找所有与特定边界线（另一条线串）相交或进入保护区（多边形）的徒步小径（线串）。

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_CONTAINS / st_contains

`ST_CONTAINS` 运算符在第一个几何图形完全包含第二个几何图形时返回 `TRUE`。这对于查找多边形内的点，或较大多边形内的较小多边形很有用。

**示例**

假设你有一系列城市街区，并且想要找到一个特定的兴趣点，比如一家餐厅，它位于给定街区的范围内。

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_INTERSECTS / st_intersects

`ST_INTERSECTS` 运算符在两个几何图形的边界或内部有任何公共点时返回 `TRUE`。这是一个用于检测任何形式空间重叠的通用运算符。

**示例**

如果你有一组道路，并且想要找出所有与代表拟建新道路的特定线串相交或接触的道路，你可以使用`ST_INTERSECTS`。

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_WITHIN / st_within

如果第一个几何图形完全位于第二个几何图形的内部或边界上，则 `ST_WITHIN` 运算符返回`TRUE`。它是`ST_CONTAINS` 的逆运算。

**示例**

你想找到所有完全位于一个较大指定公园区域内的小型居民区。

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

有关如何使用`GEOMETRY`字段的更多信息，请参阅 [Geometry 类型](./use-geometry-field)。