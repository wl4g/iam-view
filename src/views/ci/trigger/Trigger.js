import {transDate, getDay} from 'utils/'

export default {
    name: 'trigger',
    data() {
        return {

            //查询条件
            searchParams: {
                projectName: '',
            },

            //分页信息
            total: 0,
            pageNum: 1,
            pageSize: 10,

            //弹窗表单
            saveForm: {
                id: '',
                projectId: '',
                branchName: '',
                instances: [],
                tarType: '',
                remark: '',
                enable: '1',
                type: '',
                cron: '',

                //other
                group: '',
                environment: '',
            },

            dialogVisible: false,
            dialogTitle: '',
            dialogLoading: false,

            //create内的下拉数据
            ProjectData: [],
            groupData: [],
            envirData: [],
            instanceData: [],

            //列表Data
            tableData: [],

            //字典
            dictData: new Map(),

            //详情
            detailVisible: false,
            detailForm: {
                group: '',
                branch: '',
                taskDetails: [],
                result: ''
            },

            checkResult: '',

        }
    },

    mounted() {
        this.getData();
        this.getProject();
        this.getGroup();

    },

    methods: {

        onSubmit() {
            //this.loading = true;
            this.getData();
        },

        //add
        addTrigger() {
            this.cleanSaveForm();
            this.dialogVisible = true;
            this.dialogTitle = '新增';
        },

        //edit
        editTrigger(row) {
            if (!row.id) {
                return;
            }
            this.dialogVisible = true;
            this.dialogTitle = '编辑';
            this.$$api_ci_triggerDetail({
                data: {
                    id: row.id,
                },
                fn: data => {
                    if (data.code == 200) {
                        this.saveForm.id = data.data.trigger.id;
                        this.saveForm.projectId = data.data.trigger.projectId;
                        this.saveForm.branchName = data.data.trigger.branchName;
                        this.saveForm.tarType = data.data.trigger.tarType;
                        this.saveForm.remark = data.data.trigger.remark;
                        this.saveForm.enable = data.data.trigger.enable;
                        this.saveForm.type = data.data.trigger.type;
                        this.saveForm.cron = data.data.trigger.cron;

                        this.saveForm.group = data.data.appGroupId;

                        this.saveForm.environment = data.data.envId;

                        this.saveForm.instances = data.data.instances;
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        currentChange(i) {
            //this.loading = true;
            this.pageNum = i;
            this.getData();
        },

        // 获取列表数据
        getData() {
            this.$$api_ci_triggerList({
                data: {
                    projectName: this.searchParams.projectName,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                },
                fn: data => {
                    //this.loading = false;
                    if (data.code == 200) {
                        this.total = data.data.page.total;
                        this.tableData = data.data.list;
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    //this.loading = false;
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        // 获取分组名称
        getProject() {
            this.$$api_ci_allProject({
                fn: data => {
                    if (data.code == 200) {
                        this.ProjectData = data.data.list;
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        saveTrigger() {
            console.info(this.saveForm);
            this.dialogLoading = true;

            this.$$api_ci_saveTrigger({
                data: {
                    id: this.saveForm.id,
                    projectId: this.saveForm.projectId,
                    branchName: this.saveForm.branchName,
                    instances: this.saveForm.instances.toString(),
                    tarType: this.saveForm.tarType.toString(),
                    remark: this.saveForm.remark,
                    enable: this.saveForm.enable.toString(),
                    type: this.saveForm.type,
                    cron: this.saveForm.cron,
                },
                fn: data => {
                    this.dialogLoading = false;
                    if (data.code == 200) {
                        this.dialogVisible = false;
                        this.getData();
                        cleanSaveForm();
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.dialogLoading = false;
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        cleanSaveForm() {
            this.saveForm.id = '';
            this.saveForm.projectId = '';
            this.saveForm.branchName = '';
            this.saveForm.instances = [];
            this.saveForm.tarType = '';
            this.saveForm.remark = '';
            this.saveForm.enable = '1';
            this.saveForm.group = '';
            this.saveForm.environment = '';

            this.saveForm.type = '';
            this.saveForm.cron = '';
        },

        delTrigger(row) {
            if (!row.id) {
                return;
            }
            this.$$api_ci_delTrigger({
                data: {
                    id: row.id,
                },
                fn: data => {
                    //this.loading = false;
                    if (data.code == 200) {
                        //delete success
                        this.getData();
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    //this.loading = false;
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },


        //获取实例名称
        getinstance() {
            var groupId = this.saveForm.group;
            var environmentId = this.saveForm.environment;
            this.instanceData = [];

            if (environmentId == "" || groupId == "") {
                return;
            }
            this.$$api_instanceman_instancelist({
                data: {
                    groupId: groupId,
                    envId: environmentId
                },
                fn: data => {
                    if (data.code == 200) {
                        this.instanceData = data.data.instancelist;

                        //判断要不要清空选中
                        var needClean = true;
                        console.info("lenght_ ins:" + this.instanceData.length);
                        for (let i = 0; i < this.instanceData.length; i++) {
                            console.info("check:" + this.instanceData[i].id);
                            console.info("check2:" + this.saveForm.instances);
                            if (this.instanceData[i].id == this.saveForm.instances[0]) {
                                needClean = false;
                                break;
                            }
                        }
                        if (needClean) {
                            this.saveForm.instances = [];
                        }

                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        //获取环境名称
        getenvir() {
            this.envirData = [];
            var groupId = this.saveForm.group;
            if (groupId == "") {
                return;
            }
            this.$$api_instanceman_envirlist({
                data: {
                    groupId: groupId
                },
                fn: data => {
                    if (data.code == 200) {
                        this.instanceData = [];
                        this.envirData = data.data.envlist;
                        //判断要不要清空选中
                        var needClean = true;
                        console.info("lenght:" + this.envirData.length);
                        for (let i = 0; i < this.envirData.length; i++) {
                            if (this.envirData[i].id == this.saveForm.environment) {
                                needClean = false;
                                break;
                            }
                        }
                        if (needClean) {
                            this.saveForm.environment = "";
                            this.saveForm.instances = [];
                        }
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        // 获取分组名称
        getGroup() {
            this.$$api_instanceman_grouplist({
                fn: data => {
                    if (data.code == 200) {
                        this.groupData = data.data.grouplist;
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },


        checkCron() {
            this.$$api_ci_checkCron({
                data: {
                    expression: this.saveForm.cron,
                    numTimes: 5,
                },
                fn: data => {
                    //this.loading = false;
                    if (data.code == 200) {
                        //delete success
                        console.info(data.data);
                        if (data.data.validExpression) {
                            this.checkResult = data.data.nextExecTime;
                        } else {
                            this.checkResult = 'Expression unvalid';
                        }
                    } else {
                        this.$alert(data.message, '错误', {
                            confirmButtonText: '确定'
                        });
                    }
                },
                errFn: () => {
                    //this.loading = false;
                    this.$alert('访问失败，请稍后重试！', '错误', {
                        confirmButtonText: '确定',
                    });
                }
            })
        },

        convertType(row) {
            if (row.type == 4) {
                return '调度';
            }
            if (row.type == 1) {
                return '钩子';
            }
            return '--';


        },


    }
}