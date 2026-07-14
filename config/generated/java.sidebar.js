module.exports = [
  {
    "type": "category",
    "label": "Data Import",
    "key": "category:api/java/java/v2/v2-dataimport",
    "items": [
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-DataImport/v2-DataImport-BulkFileType",
        "label": "BulkFileType",
        "key": "doc:api/java/java/v2/v2-DataImport/v2-dataimport-bulkfiletype"
      },
      {
        "type": "category",
        "label": "BulkImport",
        "key": "category:api/java/java/v2/v2-DataImport/v2-dataimport-bulkimport",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-DataImport-BulkImport",
            "label": "BulkImport",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-dataimport-bulkimport"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-BulkImport-bulkImport",
            "label": "bulkImport()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-bulkimport-bulkimport"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-BulkImport-getImportProgress",
            "label": "getImportProgress()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-bulkimport-getimportprogress"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-BulkImport-listImportJobs",
            "label": "listImportJobs()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-BulkImport/v2-bulkimport-listimportjobs"
          }
        ]
      },
      {
        "type": "category",
        "label": "LocalBulkWriter",
        "key": "category:api/java/java/v2/v2-DataImport/v2-dataimport-localbulkwriter",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-LocalBulkWriter-close",
            "label": "close()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-localbulkwriter-close"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-LocalBulkWriter-commit",
            "label": "commit()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-localbulkwriter-commit"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-LocalBulkWriter-getBatchFiles",
            "label": "getBatchFiles()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-localbulkwriter-getbatchfiles"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-DataImport-LocalBulkWriter",
            "label": "LocalBulkWriter",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-dataimport-localbulkwriter"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-LocalBulkWriter-appendRow",
            "label": "appendRow()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-localbulkwriter-appendrow"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-LocalBulkWriter-getTotalRowCount",
            "label": "getTotalRowCount()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-LocalBulkWriter/v2-localbulkwriter-gettotalrowcount"
          }
        ]
      },
      {
        "type": "category",
        "label": "RemoteBulkWriter",
        "key": "category:api/java/java/v2/v2-DataImport/v2-dataimport-remotebulkwriter",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-RemoteBulkWriter-close",
            "label": "close()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-remotebulkwriter-close"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-RemoteBulkWriter-commit",
            "label": "commit()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-remotebulkwriter-commit"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-RemoteBulkWriter-getBatchFiles",
            "label": "getBatchFiles()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-remotebulkwriter-getbatchfiles"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-DataImport-RemoteBulkWriter",
            "label": "RemoteBulkWriter",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-dataimport-remotebulkwriter"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-RemoteBulkWriter-appendRow",
            "label": "appendRow()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-remotebulkwriter-appendrow"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-RemoteBulkWriter-getTotalRowCount",
            "label": "getTotalRowCount()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-RemoteBulkWriter/v2-remotebulkwriter-gettotalrowcount"
          }
        ]
      },
      {
        "type": "category",
        "label": "VolumeBulkWriter",
        "key": "category:api/java/java/v2/v2-DataImport/v2-dataimport-volumebulkwriter",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-appendRow",
            "label": "appendRow()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-appendrow"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-close",
            "label": "close()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-close"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-commit",
            "label": "commit()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-commit"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-getBatchFiles",
            "label": "getBatchFiles()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-getbatchfiles"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-getTotalRowCount",
            "label": "getTotalRowCount()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-gettotalrowcount"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-VolumeBulkWriter-getVolumeUploadResult",
            "label": "getVolumeUploadResult()",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-volumebulkwriter-getvolumeuploadresult"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-DataImport-VolumeBulkWriter",
            "label": "VolumeBulkWriter",
            "key": "doc:api/java/java/v2/v2-DataImport/v2-DataImport-VolumeBulkWriter/v2-dataimport-volumebulkwriter"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Database",
    "key": "category:api/java/java/v2/v2-database",
    "items": [
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-alterDatabaseProperties",
        "label": "alterDatabaseProperties()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-alterdatabaseproperties"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-createDatabase",
        "label": "createDatabase()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-createdatabase"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-describeDatabase",
        "label": "describeDatabase()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-describedatabase"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-dropDatabase",
        "label": "dropDatabase()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-dropdatabase"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-dropDatabaseProperties",
        "label": "dropDatabaseProperties()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-dropdatabaseproperties"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-listDatabases",
        "label": "listDatabases()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-listdatabases"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-useDatabase",
        "label": "useDatabase()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-usedatabase"
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Database/v2-Database-currentUsedDatabase",
        "label": "currentUsedDatabase()",
        "key": "doc:api/java/java/v2/v2-Database/v2-database-currentuseddatabase"
      }
    ]
  },
  {
    "type": "category",
    "label": "Volume",
    "key": "category:api/java/java/v2/v2-volume",
    "items": [
      {
        "type": "category",
        "label": "VolumeFileManager",
        "key": "category:api/java/java/v2/v2-Volume/v2-volume-volumefilemanager",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync",
            "label": "uploadFilesAsync",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeFileManager/v2-volumefilemanager-uploadfilesasync"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeFileManager/v2-Volume-VolumeFileManager",
            "label": "VolumeFileManager",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeFileManager/v2-volume-volumefilemanager"
          }
        ]
      },
      {
        "type": "category",
        "label": "VolumeManager",
        "key": "category:api/java/java/v2/v2-Volume/v2-volume-volumemanager",
        "items": [
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-VolumeManager-createVolume",
            "label": "createVolume()",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-volumemanager-createvolume"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-VolumeManager-deleteVolume",
            "label": "deleteVolume()",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-volumemanager-deletevolume"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-VolumeManager-listVolumes",
            "label": "listVolumes()",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-volumemanager-listvolumes"
          },
          {
            "type": "doc",
            "id": "api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-Volume-VolumeManager",
            "label": "VolumeManager",
            "key": "doc:api/java/java/v2/v2-Volume/v2-Volume-VolumeManager/v2-volume-volumemanager"
          }
        ]
      },
      {
        "type": "doc",
        "id": "api/java/java/v2/v2-Volume/v2-VolumeFileManager-shutdownGracefully",
        "label": "shutdownGracefully()",
        "key": "doc:api/java/java/v2/v2-Volume/v2-volumefilemanager-shutdowngracefully"
      }
    ]
  }
]
