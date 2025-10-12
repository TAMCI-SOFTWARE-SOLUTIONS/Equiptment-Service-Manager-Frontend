import {ProjectStatusEnum} from '../model/project-status.enum';

export class ProjectStatusMapper {
  static fromStringToEnum(status: string): ProjectStatusEnum {
    const validStatuses = Object.values(ProjectStatusEnum) as string[];

    const normalizedStatus = status?.toLowerCase();

    if (validStatuses.includes(normalizedStatus)) {
      return normalizedStatus as ProjectStatusEnum;
    }

    console.warn(
      `Invalid project status received: "${status}". Defaulting to PLANNED.`
    );
    return ProjectStatusEnum.PLANNED;
  }

  static fromEnumToString(status: ProjectStatusEnum): string {
    return status;
  }
}
