---
id: pipeline-public.md
title: Pipeline example
summary: An end-to-end example.
---

# Pipeline example

Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.

{{fragments/used.md}}

## Local & API

[Here](#Local--API), [shared](public-target.md#Target--API), [mapped](mapped.md), [Cloud](cloud-page.md).

![Repository](assets/diagram.png)
![External](EXTERNAL_IMAGE)
![External again](EXTERNAL_IMAGE)

<!-- doc:block:start id="connect" -->
<div class="multipleCode">
<a href="#java">Java</a>
<a href="#python">Python</a>
</div>

```java
connect("{{var.cloud.region}}");
```

```python
connect("{{var.cloud.region}}")
```
<!-- doc:block:end id="connect" -->
