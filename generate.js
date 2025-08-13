"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importDefault(require("boxen"));
const prompt_1 = require("../utils/prompt");
const files_1 = require("../utils/files");
const routes_1 = require("../utils/routes");
function generateAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const srcPath = path.join(process.cwd(), 'src');
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(srcPath)) {
            console.log((0, boxen_1.default)(chalk_1.default.red('❌ Error: src/ folder not found. Run in a NestJS project.'), {
                padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red'
            }));
            process.exit(1);
        }
        if (!fs.existsSync(packageJsonPath)) {
            console.log((0, boxen_1.default)(chalk_1.default.red('❌ Error: package.json not found.'), {
                padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red'
            }));
            process.exit(1);
        }
        const config = yield (0, prompt_1.promptConfig)();
        yield (0, files_1.generateFiles)(config);
        (0, routes_1.displayRoutes)(config);
    });
}
