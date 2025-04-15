import { Injectable, PipeTransform } from '@nestjs/common';

/**
 * Удаляет префикс Shp_ из параметров запроса.
 */
@Injectable()
export class TransformShpParamsPipe implements PipeTransform {
  transform(value: Record<string, any> | null): Record<string, any> | null {
    if (typeof value !== 'object' || value === null) return null;

    const transformed = { ...value };

    for (const key of Object.keys(value)) {
      if (key.startsWith('Shp_')) {
        const newKey = key.slice(4);
        transformed[newKey] = String(value[key]);
        delete transformed[key];
      }
    }

    return transformed;
  }
}
