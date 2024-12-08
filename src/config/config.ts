import yaml from "js-yaml";
import fs from "fs";
import path from "path";

interface PathConfig {
  origin: string;
  temp: string;
  final: string;
}

interface ConfigYml {
  path: {
    origin: string;
    temp: string;
    final: string;
  };
  obfuscator: string[];
  origin_source: {
    name: string;
    url: string;
  }[];
}

const path_config: ConfigYml = yaml.load(
  fs.readFileSync("config.yml", "utf8")
) as ConfigYml;

export const PathConfig = {
  origin: path_config.path.origin,
  temp: path_config.path.temp,
  final: path_config.path.final,
} as PathConfig;

export const ObfuscatorChoice = path_config.obfuscator;

export const OriginSource = path_config.origin_source;
