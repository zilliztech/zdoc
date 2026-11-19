# VolumeManager

A **VolumeManager** manages the volumes of a Zilliz Cloud project over the Zilliz Cloud control plane. Volumes back external collections: an **EXTERNAL** volume is read-only and can be referenced as a `volume://` source when you create or refresh an external collection, while a **MANAGED** volume is managed storage that data can be written to.

This manager talks to the Zilliz Cloud REST control plane with an API key. It is cloud-only; the open-source Milvus server has no volume concept.

```javascript
const { VolumeManager } = require('@zilliz/milvus2-sdk-node');

const volumeManager = new VolumeManager({
  cloudEndpoint: 'https://api.zilliz.com',
  apiKey: '_YOUR_API_KEY_',
});
```

## Constructor

```javascript
new VolumeManager(config: VolumeManagerConfig)
```

Constructs a **VolumeManager** instance from a **VolumeManagerConfig** object.

**PARAMETERS:**

- **config** (*VolumeManagerConfig*) -

    **[REQUIRED]**

    The configuration for the manager.

    - **cloudEndpoint** (*string*) -

        **[REQUIRED]**

        The Zilliz Cloud control-plane endpoint.

    - **apiKey** (*string*) -

        **[REQUIRED]**

        The Zilliz Cloud API key. Requests carry it as a Bearer token.

    - **fetch** (*typeof fetch*) -

        A custom `fetch` implementation. Defaults to the global `fetch`.

    - **timeout** (*number*) -

        The request timeout in milliseconds. Defaults to the SDK default HTTP timeout.

## Methods

**METHODS:**

- **createVolume** (*Promise&lt;VolumeResponse&gt;*) -

    Creates a volume in a project and region.

    - **data** (*VolumeCreateReq*) -

        **[REQUIRED]**

        - **projectId** (*string*) -

            **[REQUIRED]**

            The ID of the Zilliz Cloud project.

        - **regionId** (*string*) -

            **[REQUIRED]**

            The ID of the region the volume belongs to.

        - **volumeName** (*string*) -

            **[REQUIRED]**

            The name of the volume to create.

        - **type** (*string*) -

            The volume type: **MANAGED** (default) or **EXTERNAL**. An **EXTERNAL** volume requires **storageIntegrationId** and **path**, and is read-only.

        - **storageIntegrationId** (*string*) -

            The storage integration backing an **EXTERNAL** volume. Required when **type** is **EXTERNAL**.

        - **path** (*string*) -

            The storage path of an **EXTERNAL** volume. Required when **type** is **EXTERNAL**.

- **listVolumes** (*Promise&lt;VolumeResponse&gt;*) -

    Lists the volumes of a project.

    - **data** (*VolumeListReq*) -

        **[REQUIRED]**

        - **projectId** (*string*) -

            **[REQUIRED]**

            The ID of the Zilliz Cloud project.

        - **currentPage** (*number*) -

            The page number to return. Defaults to 1.

        - **pageSize** (*number*) -

            The number of volumes per page (1-100). Defaults to 10.

        - **type** (*string*) -

            Filters the result by volume type: **MANAGED** or **EXTERNAL**.

- **describeVolume** (*Promise&lt;VolumeResponse&gt;*) -

    Describes one volume by name.

    - **data** (*VolumeNameReq*) -

        **[REQUIRED]**

        - **volumeName** (*string*) -

            **[REQUIRED]**

            The name of the volume to describe.

- **applyVolume** (*Promise&lt;VolumeResponse&gt;*) -

    Applies a volume to a path: for a **MANAGED** volume, stages the volume data at the given path. **EXTERNAL** volumes are read-only and cannot be applied.

    - **data** (*VolumeApplyReq*) -

        **[REQUIRED]**

        - **volumeName** (*string*) -

            **[REQUIRED]**

            The name of the volume to apply.

        - **path** (*string*) -

            **[REQUIRED]**

            The path to apply the volume to.

- **deleteVolume** (*Promise&lt;VolumeResponse&gt;*) -

    Deletes one volume by name.

    - **data** (*VolumeNameReq*) -

        **[REQUIRED]**

        - **volumeName** (*string*) -

            **[REQUIRED]**

            The name of the volume to delete.

**RETURNS:**

*Promise&lt;VolumeResponse&gt;*

Each method resolves to a **VolumeResponse** carrying the control-plane response (`code`, `data`, and `message`).

All methods accept a final optional **VolumeRequestOptions** argument with **timeout** (milliseconds) and **abortController** for cancellation.

**EXCEPTIONS:**

- **Error**

    Raised when the control plane rejects the request. Inspect `code` and `message` on the response for the exact failure reason.

## Example

```javascript
const created = await volumeManager.createVolume({
  projectId: 'proj-xxxxxxxx',
  regionId: 'aws-us-west-2',
  volumeName: 'my-external-volume',
  type: 'EXTERNAL',
  storageIntegrationId: 'int-xxxxxxxx',
  path: 's3://my-bucket/volumes/main',
});

const volumes = await volumeManager.listVolumes({ projectId: 'proj-xxxxxxxx' });
```
