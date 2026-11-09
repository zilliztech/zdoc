import {openSync, writeSync, fsyncSync, closeSync} from 'node:fs'

// Private, run-correlated channel for the grouped test supervisor.
export default class StopReporter {
  onInit(ctx) {
    this.ctx=ctx;this.sequence=0
    this.runId=process.env.ZDOC_TEST_RUN_ID
    if(!this.runId||!process.env.ZDOC_TEST_EVENTS)throw new Error('Grouped reporter requires its supervisor')
    this.fd=openSync(process.env.ZDOC_TEST_EVENTS,'wx',0o600)
    this.emit('init',{pid:process.pid})
  }
  emit(kind,fields={}) {
    writeSync(this.fd,JSON.stringify({version:1,runId:this.runId,sequence:this.sequence++,kind,...fields})+'\n')
    // A failure/terminal must be retained before the supervisor can stop the group.
    if(kind==='failure'||kind==='terminal')fsyncSync(this.fd)
  }
  onTestRunStart(specs) {
    this.emit('start',{files:specs.map(s=>s.moduleId),configuration:this.ctx.projects.map(p=>({pool:p.config.pool,
      maxWorkers:p.config.maxWorkers??this.ctx.config.maxWorkers??null,isolate:p.config.isolate,fileParallelism:p.config.fileParallelism??true}))})
  }
  onTestCaseResult(test) {
    if(test.result().state==='failed')this.emit('failure',{file:test.module.moduleId,name:test.fullName,
      errors:(test.result().errors??[]).map(e=>({message:e.message,stack:e.stack}))})
  }
  onTestModuleEnd(module) {
    if(module.state()==='failed')this.emit('failure',{file:module.moduleId,name:'module failed',
      errors:module.errors().map(e=>({message:e.message,stack:e.stack}))})
  }
  onTestRunEnd(modules,errors,reason) {
    this.emit('terminal',{reason,errors:errors.map(e=>({message:e.message,stack:e.stack})),
      files:modules.map(m=>({file:m.moduleId,state:m.state()}))})
    closeSync(this.fd)
  }
}
