A database in a serving cluster is a logical container for collections hosted by a Dedicated serving cluster. Use this page to create, view, configure, use, and drop databases through a serving cluster endpoint.

<div class="alert note">

This feature is available only with the Enterprise plan or higher.

</div>

<div class="alert note">

This page is for databases in serving clusters. For project-level databases queried with on-demand compute, see [Database for On-Demand Search](on-demand-database.md). For a comparison of database models, see [Database Explained](database-concept.md).

</div>

## Before you begin

Ensure that:

- You have created a Dedicated serving cluster.

- You have the serving cluster endpoint, for example `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`.

- You have an authentication token. This can be an API key with access to the target cluster or a cluster credential in `username:password` format.

- You have **Organization Owner** or **Project Admin** access to manage databases.

When a Dedicated cluster is created, a default database is created automatically. You can create up to 1,024 databases in a Dedicated cluster.
