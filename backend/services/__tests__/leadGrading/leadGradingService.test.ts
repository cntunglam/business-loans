import { MlcbGradeEnum } from '@roshi/shared';
import { readFileSync } from 'fs';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { join } from 'path';
import { MLCBReportSchema } from '../../../models/mlcbReport.model';
import { getGrade } from '../../leadGrading.service';

describe('leadGradingService', () => {
  describe('getGrade', () => {
    const samples = ['sample1.json', 'sample2.json', 'sample3.json', 'sample4.json', 'sample5.json'].map((file) => {
      const filePath = join(__dirname, `samples/${file}`);
      const fileContent = readFileSync(filePath, 'utf8');
      const parsedJson = JSON.parse(fileContent);
      return MLCBReportSchema.parse(parsedJson);
    });

    it('should return NORMAL for empty loans', () => {
      assert.strictEqual(getGrade(samples[0]), MlcbGradeEnum.NORMAL);
    });

    it('should return BAD if any loan has >120 or BD status', () => {
      assert.strictEqual(getGrade(samples[1]), MlcbGradeEnum.BAD);
    });

    it('should return SUB if any loan has 120 status or 90 status with weightage > 0.2', () => {
      assert.strictEqual(getGrade(samples[2]), MlcbGradeEnum.SUB);
    });

    it('should return NORMAL if any loan has 60 status or 90 status with weightage < 0.2', () => {
      assert.strictEqual(getGrade(samples[3]), MlcbGradeEnum.NORMAL);
    });

    it('should return GOOD if any loan has 30 or OK status', () => {
      assert.strictEqual(getGrade(samples[4]), MlcbGradeEnum.GOOD);
    });
  });
});
