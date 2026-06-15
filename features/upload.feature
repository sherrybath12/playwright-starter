Feature: S3 Upload

    Scenario: Upload to s3
        Given a local file "upload-test.txt" exists
        When I upload the file to S3 bucket "your-bucket-name" with key "uploads/example.txt"
        Then the upload should succeed
