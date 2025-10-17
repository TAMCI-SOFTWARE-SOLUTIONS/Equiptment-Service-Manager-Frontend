import {IdentityDocumentTypeEnum} from '../../model/enums/identity-document-type.enum';

export class IdentityDocumentTypeMapper {
  static mapStringToIdentityDocumentType(identityDocumentType: string): IdentityDocumentTypeEnum {
    const normalized = (identityDocumentType ?? '').toString().trim().toLowerCase();

    const docTypeKey = Object.keys(IdentityDocumentTypeEnum).find(key => {
      const val = IdentityDocumentTypeEnum[key as keyof typeof IdentityDocumentTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (docTypeKey) {
      return IdentityDocumentTypeEnum[docTypeKey as keyof typeof IdentityDocumentTypeEnum];
    }

    console.warn(`Invalid identity document type received: ${identityDocumentType}, defaulting to OTHER`);
    return IdentityDocumentTypeEnum.OTHER;
  }

  static mapIdentityDocumentTypeToString(docType: IdentityDocumentTypeEnum): string {
    return String(docType);
  }
}
