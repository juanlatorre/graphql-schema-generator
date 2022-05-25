#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

import generateGraphqlSchema from './generateGraphqlSchema';
import {generatorHandler} from '@prisma/generator-helper';

export * from './converters/types';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './generated',
      prettyName: 'GraphQL-Schema-Generator',
    };
  },
  async onGenerate(options) {
    const output = options.generator.output?.value;
    const {config} = options.generator;

    if (output) {
      if (config?.customRules) {
        const module = await import(
          path.join(output, '..', config?.customRules)
        );

        config.customRules = module.default.rules;
      }

      const result = await generateGraphqlSchema(options.datamodel, config);

      try {
        await fs.promises.mkdir(output, {
          recursive: true,
        });

        await fs.promises.writeFile(
          path.join(output, config?.customSchema || 'schema.graphql'),
          result,
        );
      } catch (e) {
        console.error(
          'Error: unable to write files for GraphQL-Schema-Generator',
        );
        throw e;
      }
    } else {
      throw new Error('No output was specified for GraphQL-Schema-Generator');
    }
  },
});
