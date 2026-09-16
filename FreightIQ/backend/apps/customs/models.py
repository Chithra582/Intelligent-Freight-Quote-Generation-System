from django.db import models

class CustomsRequirement(models.Model):
    origin_country = models.CharField(max_length=2, db_index=True) # e.g. IN
    destination_country = models.CharField(max_length=2, db_index=True) # e.g. SG, NL, AE
    hs_code = models.CharField(max_length=12, db_index=True)
    commodity = models.CharField(max_length=255)
    incoterm = models.CharField(max_length=3, default='CIF')
    requirement_type = models.CharField(max_length=50, default='DOCUMENT')
    description = models.TextField()
    mandatory = models.BooleanField(default=True)
    risk_level = models.CharField(max_length=20, default='LOW')
    regulation_id = models.CharField(max_length=64, blank=True, null=True)
    effective_from = models.DateField(auto_now_add=True)
    effective_to = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CustomsDocumentRequirement(models.Model):
    customs_requirement = models.ForeignKey(CustomsRequirement, on_delete=models.CASCADE, related_name='doc_requirements')
    document_type = models.CharField(max_length=50) # INVOICE, PACKING_LIST, COO, SDS
    document_name = models.CharField(max_length=255)
    mandatory = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    accepted_formats = models.CharField(max_length=100, default='PDF,PNG,JPEG')
    created_at = models.DateTimeField(auto_now_add=True)

class CustomsComplianceCheck(models.Model):
    shipment_id = models.CharField(max_length=64, db_index=True)
    quote_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    origin_country = models.CharField(max_length=2)
    destination_country = models.CharField(max_length=2)
    hs_code = models.CharField(max_length=12)
    commodity = models.CharField(max_length=255)
    incoterm = models.CharField(max_length=3)
    readiness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0) # 0.00 - 100.00
    risk_level = models.CharField(max_length=20, default='LOW')
    status = models.CharField(max_length=30, default='PENDING_REVIEW') # PASS, NEEDS_DOCUMENTS, APPROVED, REJECTED
    checked_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.CharField(max_length=100, default='System')
    reviewed_by = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CustomsChecklistItem(models.Model):
    compliance_check = models.ForeignKey(CustomsComplianceCheck, on_delete=models.CASCADE, related_name='checklist_items')
    requirement_id = models.CharField(max_length=64, blank=True, null=True)
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    mandatory = models.BooleanField(default=True)
    status = models.CharField(max_length=30, default='PENDING') # VERIFIED, MISSING, PENDING
    document_required = models.BooleanField(default=True)
    document_uploaded = models.BooleanField(default=False)
    evidence = models.TextField(blank=True)
    citation = models.CharField(max_length=255, blank=True)
    reviewer_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RegulationDocument(models.Model):
    title = models.CharField(max_length=255)
    country = models.CharField(max_length=2, db_index=True)
    authority = models.CharField(max_length=100)
    document_type = models.CharField(max_length=50)
    source_url = models.URLField(blank=True)
    source_name = models.CharField(max_length=100)
    version = models.CharField(max_length=20, default='2026.1')
    effective_from = models.DateField(auto_now_add=True)
    effective_to = models.DateField(null=True, blank=True)
    published_at = models.DateField(auto_now_add=True)
    content = models.TextField()
    status = models.CharField(max_length=20, default='ACTIVE')
    last_synced_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RegulationChunk(models.Model):
    regulation_document = models.ForeignKey(RegulationDocument, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.PositiveIntegerField()
    content = models.TextField()
    embedding = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    page_number = models.PositiveIntegerField(default=1)
    section_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class HSCodeReference(models.Model):
    hs_code = models.CharField(max_length=12, primary_key=True)
    description = models.TextField()
    chapter = models.CharField(max_length=4)
    heading = models.CharField(max_length=6)
    subheading = models.CharField(max_length=8)
    commodity_type = models.CharField(max_length=100)
    restricted = models.BooleanField(default=False)
    prohibited = models.BooleanField(default=False)
    country = models.CharField(max_length=2, default='GLOBAL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
