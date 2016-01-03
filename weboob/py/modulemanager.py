
from weboob.core import WebNip
from weboob.core.modules import ModuleLoadError

import pkg_resources
import json

class ModuleManager(WebNip):
    def __init__(self):
        modules_path = pkg_resources.resource_filename('weboob_modules', '')
        super(ModuleManager, self).__init__(modules_path=modules_path)
        

    def list_bank_modules(self):
        module_list = []
        for module_name in sorted(self.modules_loader.iter_existing_module_names()):
        
            try :
                module = self.modules_loader.get_or_load_module(module_name)
            except ModuleLoadError:
                continue
            if module.has_caps('CapBank'):
                #Do not stop parsing the bank module if a module has bad config
                try:
                    formatted_module = self.format_kresus(module)
                except ModuleError as e:
                    print e.module
                    continue
                module_list.append(formatted_module)
        return module_list

    def format_kresus(self, module):
        '''
        Export the bank module to kresus format
        "docType" : "Bank"
        "name" : module.description
        "uuid" : module.name
        "backend": "weboob"
        "customFields": [
            "name":
            "type":
            "label":
            ]
        '''
        kresus_module={}
        kresus_module['docType']='Bank'
        kresus_module['name']=module.description
        kresus_module['uuid']=module.name
        kresus_module['backend']='weboob'
        custom_fields = []
        
        config=module.config.items()
        # If the module has less than 2 parameters, it cannot be used
        if len(config) < 2:
            isValid=False
        else:
            isValid=True
            number_required_fields = 0
            for key, value in config:
                if value.required:
                    number_required_fields += 1 
            isValid=isValid and number_required_fields >= 2
        if not isValid:
            raise ModuleError(module.name)
        # If the module has only 2 parameters, it is the login and password, no need to retrieve the customFields
        if len(config) > 2:
            for key, value in config:
                if key in ['password', 'login', 'userid']:
                    continue
                custom_field={}
                custom_field['name']=key
                # Label is not used for now
                # custom_field['label']= value.label
                custom_field['labelKey'] = 'settings.' + key
                custom_field['required'] = value.required
                if value.choices is None:
                    if not value.required:
                        continue
                    if value.masked:
                        custom_field['type']='password'
                    else:
                        custom_field['type']='text'
                elif len(value.choices) > 0:
                    # We only consider websites
                    if key not in ['website', 'auth_type']:
                        continue
                    custom_field['type']='select'
                    if value.default is not None:
                        custom_field['default']=value.default
                    choices = []
                    for key, label in value.choices.iteritems():
                        choices.append(dict(label=label, value=key))
                    custom_field['values'] = choices
                custom_fields.append(custom_field)
            if len(custom_fields) > 0:
                kresus_module['customFields']=custom_fields
        return kresus_module

class ModuleError(Exception):
    def __init__(self, module_name):
        Exception.__init__(self , 'The module shall have at least 2 required fields')
        self.module = module_name

module_manager=ModuleManager()
content=module_manager.list_bank_modules()
print json.dumps(content, ensure_ascii=False, indent=4, separators=(',', ': ')).encode('utf-8')
