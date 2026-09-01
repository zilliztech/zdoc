---
title: "Schema Evolution | Cloud"
slug: /schema-evolution
sidebar_label: "Schema Evolution"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Schema evolution lets you add fields to an existing collection without rebuilding it or taking production traffic offline. However, adding a field changes only the collection schema. Existing entities do not automatically receive values for the new field, while new and updated entities may continue to arrive during the migration. | Cloud"
type: origin
token: P5q7wCCk5i3rlEkceyjcQMi0nSc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Schema Evolution

Schema evolution lets you add fields to an existing collection without rebuilding it or taking production traffic offline. However, adding a field changes only the collection schema. Existing entities do not automatically receive values for the new field, while new and updated entities may continue to arrive during the migration.

This article illustrates the common procedure for schema evolution

## Understand the workflow\{#understand-the-workflow}

To evolve the schema of a live collection safely, follow a coordinated sequence:

![OQbQwegIUhOoBXbDgfAcMfw0n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/OQbQwegIUhOoBXbDgfAcMfw0n5e.png)

As illustrated in the sequence above, the entire migration flow is as follows:

1. **[Prepare readers and writers](./schema-evolution#step-1-prepare-readers-and-writers).** 

    Ensure that your application is ready to write and read the new fields.

1. **[Add the new fields](./schema-evolution#step-2-add-the-new-fields).** 

    Extend the collection schema with the required fields. 

1. **[Switch writes](./schema-evolution#step-3-switch-writes).** 

    Make all new and updated entities populate the new fields. 

1. **[Backfill existing entities](./schema-evolution#step-4-backfill-existing-entities).** 

    Populate the new fields for historical data. 

1. **[Validate migration](./schema-evolution#step-5-validate-migration).** 

    Verify that both historical and newly written entities contain the expected values. 

1. **[Switch reads](./schema-evolution#step-6-switch-reads).** 

    Start using the new fields for production reads.

The order matters: Switch application writes before starting the backfill so that entities created or updated during the migration already contain values for the new fields. After the backfill completes, validate both historical and newly written data before switching reads to the new fields.

## Before you start\{#before-you-start}

Before evolving the schema of a live collection, ensure that:

- Your application can be updated to read from and write to the new fields.

- The source data required to populate the new fields for existing entities is available.

- Each source record can be matched to an existing entity by primary key.

- The existing fields remain available until the migration is validated.

## Step 1: Prepare readers and writers\{#step-1-prepare-readers-and-writers}

Before changing the collection schema, prepare your application to read from and write to the new fields. Deploy these changes behind configuration or feature flags, but keep them disabled until the new fields have been added to the collection.

For example, suppose you plan to add a `category` field. You can prepare the writer to include the field when the new schema is enabled:

```python
# Pseudocode
def build_entity(document, use_new_schema=False):
    entity = {
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
    }

    if use_new_schema:
        entity["category"] = document["category"]

    return entity
```

Prepare readers in the same way so that they can consume the new field after the migration is validated:

```python
# Pseudocode
def get_output_fields(use_new_schema=False):
    fields = ["id", "text"]

    if use_new_schema:
        fields.append("category")

    return fields
```

At this stage, keep both switches disabled. Production reads and writes should continue to use the existing schema until the new fields are added.

## Step 2: Add the new fields\{#step-2-add-the-new-fields}

After the updated readers and writers are ready, add the required fields to the existing collection schema. At this point, keep the new application paths disabled.

For example, the following code adds a nullable `category` field:

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="category",
    data_type=DataType.VARCHAR,
    max_length=64,
    nullable=True,
)
```

Adding a field changes only the collection schema. Existing entities are not rewritten and have `NULL` in the new field until the field is populated later in the migration.

Once the schema change succeeds, proceed to switch application writes so that all newly inserted or updated entities populate the new field.

## Step 3: Switch writes\{#step-3-switch-writes}

After the new fields are available in the collection schema, enable the updated writer so that all new inserts and full-row upserts populate them.

For example, enable the writer path prepared earlier:

```python
USE_NEW_SCHEMA = True

entity = build_entity(document, use_new_schema=USE_NEW_SCHEMA)

client.insert(
    collection_name="documents",
    data=[entity],
)
```

For a full-row upsert, include the new field in the payload as well:

```python
client.upsert(
    collection_name="documents",
    data=[{
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
        "category": document["category"],
    }],
)
```

Complete the writer switch before starting the backfill. From this point on, newly inserted or updated entities already contain values for the new fields, while existing entities are populated by the backfill. This ordering prevents a gap where writes made during the migration are missed by both paths.

Keep production reads on the existing fields until the backfill is complete and the migration is validated.

## Step 4: Backfill existing entities\{#step-4-backfill-existing-entities}

After all application writers have switched to the new schema, backfill the new fields for entities that existed before the switch.

Prepare the data files that contain the primary key and the values to write to the new fields. For an online migration, use `coalesce` to preserve values already written by the application while populating missing values in historical entities.

In Zilliz Cloud, submit a data backfill job. Zilliz Cloud manages the collection snapshot, Spark execution, and backfill commit as part of the job.

Before submitting the backfill, you can optionally run a precheck to validate the input data and field mappings.

The following snippet demonstrates how to submit a data backfill job. For details on preparing the input, running a precheck against your data, choosing a backfill mode, submitting a backfill job, and monitoring the job, see [Data Backfill ](./data-backfill).

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: schema-evolution-backfill-001" \
    --header "Content-Type: application/json" \
    --data '{
      "description": "Backfill category for existing documents",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "documents",
      "fields": ["category"],
      "input": {
        "type": "volume",
        "volumeName": "migration-data",
        "path": "schema-evolution/category-backfill.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_category": "category"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
```

## Step 5: Validate migration\{#step-5-validate-migration}

After the backfill completes, verify that the new fields are populated correctly before switching production reads to them.

Start by querying a representative set of entities, including both historical entities processed by the backfill and entities inserted or updated after the writer switch:

```python
results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=["id", "category"],
)

for result in results:
    print(result)
```

Check that:

- Historical entities contain the expected values in the new fields.

- Entities written after the writer switch also contain valid values.

- No unexpected `NULL` values or mismatches remain in the population you plan to serve.

For large collections, validate both overall coverage and representative data segments or application cohorts rather than relying only on a few sampled entities.

Proceed to switch production reads only after the new fields meet your application requirements.

## Step 6: Switch reads\{#step-6-switch-reads}

After the migration has been validated, update your application readers to use the new fields.

For example, enable the reader path prepared earlier:

```python
USE_NEW_SCHEMA = True

results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=get_output_fields(use_new_schema=USE_NEW_SCHEMA),
)
```

If the new field changes search behavior, such as when a new vector field is used with a different embedding model, switch the entire read path together, including the query model, target field, and related search configuration.

Roll out the change gradually when possible, and keep the previous read path available until the rollback window has closed.

## Failure handling and rollback\{#failure-handling-and-rollback}

Keep the existing fields and read path available until the migration has been validated and the rollback window has closed. If a problem occurs, stop advancing the migration and recover from the current stage.

| **Stage** | **Recommended action** |
| --- | --- |
| Writer switch fails | Keep production reads on the existing fields and complete the writer rollout before starting the backfill. |
| Precheck fails | Do not start the backfill. Fix the staged data or configuration, then run the precheck again. |
| Backfill fails | Keep production reads on the existing fields, fix the issue, and retry the backfill. |
| Validation fails | Do not switch reads. Repair missing, stale, or incorrect values, then validate again. |
| New read path regresses | Route production reads back to the existing fields while keeping the new fields and backfilled data intact. |
| Migration succeeds | Keep the existing fields through an agreed rollback window. Remove old fields, indexes, or application logic only after the new path remains stable. |

For migrations that change retrieval behavior, such as moving to a new embedding model or search representation, use a gradual read rollout when possible.

A backfill failure usually does not require a data rollback because production reads still use the existing fields. The main rollback point is after switching reads, where the safest recovery is typically to route traffic back to the old fields rather than remove the new data.

## Next steps\{#next-steps}

Use this workflow as the foundation for more specific schema evolution scenarios. The following runbooks apply the same migration sequence to common changes in vector search applications:



import DocCardList from '@theme/DocCardList';

<DocCardList />